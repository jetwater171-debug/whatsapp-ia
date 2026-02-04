import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const bodySchema = z.object({
  leadId: z.string().uuid(),
  status: z.enum(["novo", "em_conversa", "comprou", "precisa_intervir"]).optional(),
  name: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return new Response("Invalid payload", { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const updateData: Record<string, unknown> = {};
  if (parsed.data.status) updateData.status = parsed.data.status;
  if (parsed.data.name) updateData.name = parsed.data.name;
  if (parsed.data.tags) updateData.tags = parsed.data.tags;

  await admin.from("leads").update(updateData).eq("id", parsed.data.leadId);

  return Response.json({ ok: true });
}
