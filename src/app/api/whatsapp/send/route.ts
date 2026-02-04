import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendWhatsAppMessage } from "@/lib/whatsapp/meta";

const bodySchema = z.object({
  conversationId: z.string().uuid(),
  text: z.string().min(1),
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
    .select("id,lead_id,wa_number_id")
    .eq("id", parsed.data.conversationId)
    .single();

  const { data: lead } = await admin
    .from("leads")
    .select("phone")
    .eq("id", conversation.lead_id)
    .single();

  const { data: waNumber } = await admin
    .from("wa_numbers")
    .select("phone_number_id,wa_account_id")
    .eq("id", conversation.wa_number_id)
    .single();

  const { data: waAccount } = await admin
    .from("wa_accounts")
    .select("access_token")
    .eq("id", waNumber.wa_account_id)
    .single();

  await sendWhatsAppMessage({
    accessToken: waAccount.access_token,
    phoneNumberId: waNumber.phone_number_id,
    to: lead.phone,
    text: parsed.data.text,
  });

  await admin.from("messages").insert({
    conversation_id: conversation.id,
    direction: "out",
    content: parsed.data.text,
    status: "sent",
  });

  return Response.json({ ok: true });
}
