import Link from "next/link";
import { getDashboardStats } from "@/lib/data";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <section className="space-y-8">
      <div className="surface-strong animate-enter p-8">
        <p className="eyebrow">Painel geral</p>
        <h1 className="mt-4 text-4xl text-balance">Operacao em tempo real</h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">
          Acompanhe os leads entrando, o volume de mensagens e onde a sua
          intervencao e necessaria.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="surface animate-rise p-6">
          <p className="eyebrow">Leads</p>
          <p className="mt-4 text-3xl font-semibold text-foreground">
            {stats.totalLeads}
          </p>
          <p className="text-sm text-muted-foreground">Total na base</p>
        </div>
        <div className="surface animate-rise delay-1 p-6">
          <p className="eyebrow">Novos</p>
          <p className="mt-4 text-3xl font-semibold text-foreground">
            {stats.novos}
          </p>
          <p className="text-sm text-muted-foreground">Chegaram hoje</p>
        </div>
        <div className="surface animate-rise delay-2 p-6">
          <p className="eyebrow">Comprou</p>
          <p className="mt-4 text-3xl font-semibold text-foreground">
            {stats.comprou}
          </p>
          <p className="text-sm text-muted-foreground">Conversoes</p>
        </div>
        <div className="surface animate-rise delay-3 p-6">
          <p className="eyebrow">Intervencao</p>
          <p className="mt-4 text-3xl font-semibold text-foreground">
            {stats.intervencao}
          </p>
          <p className="text-sm text-muted-foreground">Precisa agir</p>
        </div>
      </div>

      <div className="surface grid gap-6 p-6 md:grid-cols-2">
        <div>
          <p className="eyebrow">Meta da semana</p>
          <h2 className="mt-3 text-2xl">Aumentar conversao para 18%</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Deixe a IA conduzir o funil e entre apenas quando o lead pedir preco
            final ou demonstrar duvidas criticas.
          </p>
        </div>
        <div className="rounded-[24px] border border-white/60 bg-white/70 p-5">
          <p className="eyebrow">Atalhos</p>
          <div className="mt-4 space-y-3 text-sm text-foreground">
            <Link
              href="/settings"
              className="flex items-center justify-between rounded-2xl border border-transparent bg-white/70 px-4 py-3 transition hover:border-foreground/15 hover:bg-white"
            >
              <span>Configurar WhatsApp</span>
              <span className="chip">Agora</span>
            </Link>
            <Link
              href="/settings"
              className="flex items-center justify-between rounded-2xl border border-transparent bg-white/70 px-4 py-3 transition hover:border-foreground/15 hover:bg-white"
            >
              <span>Ajustar prompt da IA</span>
              <span className="chip">Revisar</span>
            </Link>
            <Link
              href="/leads"
              className="flex items-center justify-between rounded-2xl border border-transparent bg-white/70 px-4 py-3 transition hover:border-foreground/15 hover:bg-white"
            >
              <span>Ver leads comprados</span>
              <span className="text-xs text-muted-foreground">
                {stats.comprou}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
