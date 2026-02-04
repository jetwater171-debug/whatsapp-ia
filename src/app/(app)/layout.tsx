import { redirect } from "next/navigation";
import AppShell from "@/components/AppShell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasServiceRole, hasSupabaseConfig } from "@/lib/env";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let userEmail: string | null = null;

  if (hasSupabaseConfig) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    userEmail = user.email ?? null;
  }

  return (
    <AppShell
      setup={{
        hasSupabaseConfig,
        hasServiceRole,
        userEmail,
      }}
    >
      {children}
    </AppShell>
  );
}
