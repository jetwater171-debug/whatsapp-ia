import { z } from "zod";
import { ensureWorkspaceForUser } from "@/lib/server/workspace";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const bodySchema = z.object({
  systemPrompt: z.string().min(10),
  temperature: z.number().min(0).max(1).optional(),
  model: z.string().optional(),
});

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
      systemPrompt: data?.system_prompt ?? "",
      temperature: data?.temperature ?? 0.4,
      model: data?.model ?? "gemini-2.5-flash",
    });
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return new Response("Invalid payload", { status: 400 });
  }

  const { workspaceId } = await ensureWorkspaceForUser();
  const admin = createSupabaseAdminClient();

  await admin
    .from("ai_settings")
    .upsert(
      {
        workspace_id: workspaceId,
        system_prompt: parsed.data.systemPrompt,
        temperature: parsed.data.temperature ?? 0.4,
        model: parsed.data.model ?? "gemini-2.5-flash",
        enabled: true,
      },
      { onConflict: "workspace_id" }
    )
    .select("workspace_id")
    .single();

  return Response.json({ ok: true });
}
