import Link from "next/link";
import { ReactNode } from "react";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/inbox", label: "Inbox" },
  { href: "/leads", label: "Leads" },
  { href: "/settings", label: "Configurações" },
];

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-8 lg:px-8">
        <aside className="hidden w-56 flex-col gap-6 rounded-[28px] border border-white/60 bg-white/70 p-6 text-sm shadow-[0_20px_50px_-35px_rgba(0,0,0,0.4)] backdrop-blur lg:flex">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">WhatsApp IA</p>
            <p className="mt-2 text-lg font-semibold text-foreground">Operação</p>
          </div>
          <nav className="flex flex-1 flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-transparent px-4 py-2 text-sm text-muted-foreground transition hover:border-foreground/10 hover:bg-white hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="rounded-2xl bg-foreground px-4 py-3 text-xs text-white">
            IA autônoma ativa<br />
            <span className="text-white/70">Gemini 2.5 Flash</span>
          </div>
        </aside>
        <main className="flex-1 space-y-8">{children}</main>
      </div>
    </div>
  );
}
