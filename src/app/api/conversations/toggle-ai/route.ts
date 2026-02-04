import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const bodySchema = z.object({
  conversationId: z.string().uuid(),
  enabled: z.boolean(),
});

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Erro inesperado";

const toErrorResponse = (message: string, status = 500) =>
  Response.json({ ok: false, error: message }, { status });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return toErrorResponse("Campos invalidos.", 400);
    }

    const admin = createSupabaseAdminClient();
    const { error } = await admin
      .from("conversations")
      .update({ ai_enabled: parsed.data.enabled })
      .eq("id", parsed.data.conversationId);

    if (error) {
      return toErrorResponse("Erro ao atualizar conversa.", 500);
    }

    return Response.json({ ok: true });
  } catch (error) {
    const message = getErrorMessage(error);
    return toErrorResponse(message, 500);
  }
}
