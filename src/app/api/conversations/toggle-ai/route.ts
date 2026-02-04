import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const bodySchema = z.object({
  conversationId: z.string().uuid(),
  enabled: z.boolean(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return new Response("Invalid payload", { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  await admin
    .from("conversations")
    .update({ ai_enabled: parsed.data.enabled })
    .eq("id", parsed.data.conversationId);

  return Response.json({ ok: true });
}
