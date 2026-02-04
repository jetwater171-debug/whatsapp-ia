import { NextRequest } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { generateGeminiReply } from "@/lib/ai/gemini";
import { sendWhatsAppMessage } from "@/lib/whatsapp/meta";

const webhookSchema = z.object({
  object: z.string(),
  entry: z.array(
    z.object({
      id: z.string(),
      changes: z.array(
        z.object({
          value: z.object({
            metadata: z.object({
              phone_number_id: z.string(),
            }),
            contacts: z
              .array(
                z.object({
                  wa_id: z.string(),
                  profile: z.object({ name: z.string().optional() }).optional(),
                })
              )
              .optional(),
            messages: z
              .array(
                z.object({
                  id: z.string(),
                  from: z.string(),
                  timestamp: z.string().optional(),
                  type: z.string(),
                  text: z.object({ body: z.string() }).optional(),
                })
              )
              .optional(),
          }),
        })
      ),
    })
  ),
});

const extractInboundMessages = (payload: z.infer<typeof webhookSchema>) => {
  const items: Array<{
    phoneNumberId: string;
    from: string;
    body: string;
    messageId: string;
    leadName?: string;
  }> = [];

  payload.entry.forEach((entry) => {
    entry.changes.forEach((change) => {
      const phoneNumberId = change.value.metadata.phone_number_id;
      const leadName = change.value.contacts?.[0]?.profile?.name;
      change.value.messages?.forEach((message) => {
        if (message.type !== "text") return;
        const body = message.text?.body ?? "";
        items.push({
          phoneNumberId,
          from: message.from,
          body,
          messageId: message.id,
          leadName,
        });
      });
    });
  });

  return items;
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === env.whatsappVerifyToken) {
    return new Response(challenge ?? "", { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const parsed = webhookSchema.safeParse(payload);

  if (!parsed.success) {
    return new Response("Invalid payload", { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const inboundMessages = extractInboundMessages(parsed.data);

  for (const inbound of inboundMessages) {
    const { data: existingMessage } = await admin
      .from("messages")
      .select("id")
      .eq("provider_message_id", inbound.messageId)
      .maybeSingle();

    if (existingMessage) continue;

    const { data: waNumber } = await admin
      .from("wa_numbers")
      .select("id, wa_account_id")
      .eq("phone_number_id", inbound.phoneNumberId)
      .maybeSingle();

    if (!waNumber) continue;

    const { data: waAccount } = await admin
      .from("wa_accounts")
      .select("id, workspace_id, access_token")
      .eq("id", waNumber.wa_account_id)
      .single();

    const workspaceId = waAccount.workspace_id;

    const { data: lead } = await admin
      .from("leads")
      .select("id,name,status")
      .eq("workspace_id", workspaceId)
      .eq("phone", inbound.from)
      .maybeSingle();

    const leadId = lead?.id ?? (
      await admin
        .from("leads")
        .insert({
          workspace_id: workspaceId,
          name: inbound.leadName ?? null,
          phone: inbound.from,
          status: "novo",
        })
        .select("id")
        .single()
    ).data?.id;

    if (!leadId) continue;

    const { data: conversation } = await admin
      .from("conversations")
      .select("id,ai_enabled")
      .eq("workspace_id", workspaceId)
      .eq("lead_id", leadId)
      .eq("wa_number_id", waNumber.id)
      .maybeSingle();

    const conversationId = conversation?.id ?? (
      await admin
        .from("conversations")
        .insert({
          workspace_id: workspaceId,
          lead_id: leadId,
          wa_number_id: waNumber.id,
          ai_enabled: true,
        })
        .select("id")
        .single()
    ).data?.id;

    if (!conversationId) continue;

    await admin.from("messages").insert({
      conversation_id: conversationId,
      direction: "in",
      content: inbound.body,
      provider_message_id: inbound.messageId,
    });

    await admin
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", conversationId);
    await admin
      .from("leads")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", leadId);

    if (!conversation?.ai_enabled) continue;

    try {
      const { data: aiSettings } = await admin
        .from("ai_settings")
        .select("model,temperature,system_prompt")
        .eq("workspace_id", workspaceId)
        .maybeSingle();

      const { data: messages } = await admin
        .from("messages")
        .select("direction,content")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
        .limit(12);

      const aiReply = await generateGeminiReply({
        systemPrompt: aiSettings?.system_prompt ?? "",
        modelName: aiSettings?.model ?? "gemini-2.5-flash",
        temperature: aiSettings?.temperature ?? 0.4,
        leadName: lead?.name ?? inbound.leadName,
        leadStatus: lead?.status ?? "novo",
        messages: (messages ?? []).map((msg) => ({
          role: msg.direction === "in" ? "user" : "assistant",
          content: msg.content ?? "",
        })),
      });

      await sendWhatsAppMessage({
        accessToken: waAccount.access_token,
        phoneNumberId: inbound.phoneNumberId,
        to: inbound.from,
        text: aiReply,
      });

      await admin.from("messages").insert({
        conversation_id: conversationId,
        direction: "out",
        content: aiReply,
        status: "sent",
      });

      await admin.from("events").insert({
        workspace_id: workspaceId,
        type: "ai_response",
        payload_json: {
          conversationId,
          aiReply,
        },
      });
    } catch (error) {
      await admin.from("interventions").insert({
        conversation_id: conversationId,
        reason: error instanceof Error ? error.message : "Erro IA",
        status: "open",
      });
    }
  }

  return new Response("OK", { status: 200 });
}
