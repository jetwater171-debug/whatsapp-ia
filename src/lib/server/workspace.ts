import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/env";

export const ensureWorkspaceForUser = async () => {
  if (!hasSupabaseConfig) {
    throw new Error("Supabase nao configurado.");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Usuario nao autenticado.");
  }

  const admin = createSupabaseAdminClient();
  const { data: existingMember } = await admin
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingMember?.workspace_id) {
    return { workspaceId: existingMember.workspace_id, userId: user.id };
  }

  const { data: workspace } = await admin
    .from("workspaces")
    .insert({
      name: "Workspace principal",
      owner_user_id: user.id,
    })
    .select("id")
    .single();

  if (!workspace?.id) {
    throw new Error("Nao foi possivel criar workspace.");
  }

  await admin.from("workspace_members").insert({
    workspace_id: workspace.id,
    user_id: user.id,
    role: "admin",
  });

  return { workspaceId: workspace.id, userId: user.id };
};
