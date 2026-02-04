import { z } from "zod";
import { ensureWorkspaceForUser } from "@/lib/server/workspace";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const bodySchema = z.object({
  systemPrompt: z.string().min(10),
  temperature: z.number().min(0).max(1).optional(),
  model: z.string().optional(),
});

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Erro inesperado";

const toErrorResponse = (message: string, status = 500) =>
  Response.json({ ok: false, error: message }, { status });

export async function GET() {
  try {
    const { workspaceId } = await ensureWorkspaceForUser();
    const admin = createSupabaseAdminClient();
    const { data } = await admin
      .from("ai_settings")
      .select("system_prompt,temperature,model")
      .eq("workspace_id", workspaceId)
      .maybeSingle();

    return Response.json({
      ok: true,
      systemPrompt: data?.system_prompt ?? "",
      temperature: data?.temperature ?? 0.4,
      model: data?.model ?? "gemini-2.5-flash",
    });
  } catch (error) {
    const message = getErrorMessage(error);
    const status = message.toLowerCase().includes("autenticado") ? 401 : 500;
    return toErrorResponse(message, status);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return toErrorResponse("Campos invalidos.", 400);
    }

    const { workspaceId } = await ensureWorkspaceForUser();
    const admin = createSupabaseAdminClient();
    const systemPrompt = parsed.data.systemPrompt.trim();

    const { error } = await admin
      .from("ai_settings")
      .upsert(
        {
          workspace_id: workspaceId,
          system_prompt: systemPrompt,
          temperature: parsed.data.temperature ?? 0.4,
          model: parsed.data.model ?? "gemini-2.5-flash",
          enabled: true,
        },
        { onConflict: "workspace_id" }
      )
      .select("workspace_id")
      .single();

    if (error) {
      return toErrorResponse("Erro ao salvar as configuracoes da IA.", 500);
    }

    return Response.json({ ok: true });
  } catch (error) {
    const message = getErrorMessage(error);
    const status = message.toLowerCase().includes("autenticado") ? 401 : 500;
    return toErrorResponse(message, status);
  }
}
