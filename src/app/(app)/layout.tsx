import AppShell from "@/components/AppShell";
import { hasServiceRole, hasSupabaseConfig } from "@/lib/env";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell
      setup={{
        hasSupabaseConfig,
        hasServiceRole,
      }}
    >
      {children}
    </AppShell>
  );
}
