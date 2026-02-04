import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const ensureWorkspaceForUser = async () => {
  const admin = createSupabaseAdminClient();
  const { data: existingWorkspace } = await admin
    .from("workspaces")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existingWorkspace?.id) {
    return { workspaceId: existingWorkspace.id };
  }

  const { data: workspace, error } = await admin
    .from("workspaces")
    .insert({
      name: "Workspace principal",
    })
    .select("id")
    .single();

  if (error || !workspace?.id) {
    throw new Error("Nao foi possivel criar workspace.");
  }

  return { workspaceId: workspace.id };
};
