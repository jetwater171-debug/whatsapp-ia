import { z } from "zod";
import { ensureWorkspaceForUser } from "@/lib/server/workspace";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const bodySchema = z.object({
  accessToken: z.string().min(8),
  phoneNumberId: z.string().min(4),
  displayPhoneNumber: z.string().optional(),
});

export async function GET() {
  try {
    const { workspaceId } = await ensureWorkspaceForUser();
    const admin = createSupabaseAdminClient();

    const { data: waAccount } = await admin
      .from("wa_accounts")
      .select("id,access_token")
      .eq("workspace_id", workspaceId)
      .maybeSingle();

    const { data: waNumber } = waAccount
      ? await admin
          .from("wa_numbers")
          .select("phone_number_id,display_phone_number")
          .eq("wa_account_id", waAccount.id)
          .maybeSingle()
      : { data: null };

    return Response.json({
      accessToken: waAccount?.access_token ?? "",
      phoneNumberId: waNumber?.phone_number_id ?? "",
      displayPhoneNumber: waNumber?.display_phone_number ?? "",
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

  const { data: waAccount } = await admin
    .from("wa_accounts")
    .upsert(
      {
        workspace_id: workspaceId,
        provider: "meta",
        access_token: parsed.data.accessToken,
      },
      { onConflict: "workspace_id" }
    )
    .select("id")
    .single();

  if (!waAccount?.id) {
    return new Response("Erro ao salvar conta", { status: 500 });
  }

  await admin
    .from("wa_numbers")
    .upsert(
      {
        wa_account_id: waAccount.id,
        phone_number_id: parsed.data.phoneNumberId,
        display_phone_number: parsed.data.displayPhoneNumber ?? null,
        status: "active",
      },
      { onConflict: "phone_number_id" }
    )
    .select("id")
    .single();

  return Response.json({ ok: true });
}
