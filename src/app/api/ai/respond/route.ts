import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { generateGeminiReply } from "@/lib/ai/gemini";

const bodySchema = z.object({
  conversationId: z.string().uuid(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return new Response("Invalid payload", { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data: conversation } = await admin
    .from("conversations")
    .select("id,workspace_id,lead_id")
    .eq("id", parsed.data.conversationId)
    .single();

  if (!conversation) {
    return new Response("Conversation not found", { status: 404 });
  }

  const { data: lead } = await admin
    .from("leads")
    .select("name,status")
    .eq("id", conversation.lead_id)
    .single();

  const { data: aiSettings } = await admin
    .from("ai_settings")
    .select("model,temperature,system_prompt")
    .eq("workspace_id", conversation.workspace_id)
    .maybeSingle();

  const { data: messages } = await admin
    .from("messages")
    .select("direction,content")
    .eq("conversation_id", conversation.id)
    .order("created_at", { ascending: true })
    .limit(12);

  const aiReply = await generateGeminiReply({
    systemPrompt: aiSettings?.system_prompt ?? "",
    modelName: aiSettings?.model ?? "gemini-2.5-flash",
    temperature: aiSettings?.temperature ?? 0.4,
    leadName: lead?.name,
    leadStatus: lead?.status,
    messages: (messages ?? []).map((msg) => ({
      role: msg.direction === "in" ? "user" : "assistant",
      content: msg.content ?? "",
    })),
  });

  return Response.json({ reply: aiReply });
}
