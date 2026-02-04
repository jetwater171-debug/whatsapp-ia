import Link from "next/link";
import { ReactNode } from "react";
import NavLinks from "@/components/NavLinks";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/inbox", label: "Inbox" },
  { href: "/leads", label: "Leads" },
  { href: "/settings", label: "Configuracoes" },
];

type SetupState = {
  hasSupabaseConfig: boolean;
  hasServiceRole: boolean;
};

export default function AppShell({
  children,
  setup,
}: {
  children: ReactNode;
  setup?: SetupState;
}) {
  const needsSupabase = !setup?.hasSupabaseConfig;
  const needsServiceRole = !setup?.hasServiceRole;

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-8 lg:px-8">
        <aside className="hidden w-64 flex-col gap-6 lg:flex">
          <div className="surface-strong p-6">
            <p className="eyebrow">WhatsApp IA</p>
            <p className="mt-3 text-2xl text-foreground">Operacao viva</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Controle o funil e deixe a IA fazer o grosso do trabalho.
            </p>
          </div>
          <nav className="surface flex flex-1 flex-col gap-2 p-4 text-sm">
            <NavLinks items={navItems} variant="sidebar" />
          </nav>
          <div className="surface p-4">
            <div className="rounded-2xl bg-foreground px-4 py-3 text-xs text-white">
              IA autonoma ativa
              <br />
              <span className="text-white/70">Gemini 2.5 Flash</span>
            </div>
          </div>
        </aside>

        <main className="flex-1 space-y-8">
          <div className="surface flex flex-col gap-4 p-4 lg:hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow">WhatsApp IA</p>
                <p className="text-lg text-foreground">Operacao viva</p>
              </div>
              <Link className="btn btn-outline" href="/settings">
                Configurar
              </Link>
            </div>
            <NavLinks items={navItems} variant="mobile" />
          </div>

          {(needsSupabase || needsServiceRole) && (
            <div className="surface animate-enter p-5">
              <p className="eyebrow">Configuracao pendente</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Para salvar tokens e operar o painel, finalize as variaveis de ambiente.
              </p>
              <div className="mt-4 grid gap-2 text-xs text-muted-foreground">
                {needsSupabase && (
                  <div>- Defina `NEXT_PUBLIC_SUPABASE_URL`.</div>
                )}
                {needsServiceRole && (
                  <div>- Defina `SUPABASE_SERVICE_ROLE_KEY` para salvar WhatsApp e IA.</div>
                )}
              </div>
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}
