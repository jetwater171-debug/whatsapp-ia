import { z } from "zod";
import { ensureWorkspaceForUser } from "@/lib/server/workspace";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const bodySchema = z.object({
  accessToken: z.string().min(8),
  phoneNumberId: z.string().min(4),
  displayPhoneNumber: z.string().optional(),
});

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Erro inesperado";

const toErrorResponse = (message: string, status = 500) =>
  Response.json({ ok: false, error: message }, { status });

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
      ok: true,
      accessToken: waAccount?.access_token ?? "",
      phoneNumberId: waNumber?.phone_number_id ?? "",
      displayPhoneNumber: waNumber?.display_phone_number ?? "",
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
    const accessToken = parsed.data.accessToken.trim();
    const phoneNumberId = parsed.data.phoneNumberId.trim();
    const displayPhoneNumber = parsed.data.displayPhoneNumber?.trim() || null;

    const { data: waAccount, error: waAccountError } = await admin
      .from("wa_accounts")
      .upsert(
        {
          workspace_id: workspaceId,
          provider: "meta",
          access_token: accessToken,
        },
        { onConflict: "workspace_id" }
      )
      .select("id")
      .single();

    if (waAccountError || !waAccount?.id) {
      return toErrorResponse("Erro ao salvar a conta do WhatsApp.", 500);
    }

    const { error: waNumberError } = await admin
      .from("wa_numbers")
      .upsert(
        {
          wa_account_id: waAccount.id,
          phone_number_id: phoneNumberId,
          display_phone_number: displayPhoneNumber,
          status: "active",
        },
        { onConflict: "phone_number_id" }
      )
      .select("id")
      .single();

    if (waNumberError) {
      return toErrorResponse("Erro ao salvar o numero do WhatsApp.", 500);
    }

    return Response.json({ ok: true });
  } catch (error) {
    const message = getErrorMessage(error);
    const status = message.toLowerCase().includes("autenticado") ? 401 : 500;
    return toErrorResponse(message, status);
  }
}
