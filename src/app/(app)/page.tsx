import { getDashboardStats } from "@/lib/data";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <section className="space-y-8">
      <div className="glass rounded-[32px] p-8">
        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
          Painel geral
        </p>
        <h1 className="mt-4 text-4xl">Operação em tempo real</h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">
          Acompanhe os leads entrando, o volume de mensagens e onde a sua
          intervenção é necessária.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="glass rounded-[24px] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Leads
          </p>
          <p className="mt-4 text-3xl font-semibold text-foreground">
            {stats.totalLeads}
          </p>
          <p className="text-sm text-muted-foreground">Total na base</p>
        </div>
        <div className="glass rounded-[24px] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Novos
          </p>
          <p className="mt-4 text-3xl font-semibold text-foreground">
            {stats.novos}
          </p>
          <p className="text-sm text-muted-foreground">Chegaram hoje</p>
        </div>
        <div className="glass rounded-[24px] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Comprou
          </p>
          <p className="mt-4 text-3xl font-semibold text-foreground">
            {stats.comprou}
          </p>
          <p className="text-sm text-muted-foreground">Conversões</p>
        </div>
        <div className="glass rounded-[24px] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Intervenção
          </p>
          <p className="mt-4 text-3xl font-semibold text-foreground">
            {stats.intervencao}
          </p>
          <p className="text-sm text-muted-foreground">Precisa agir</p>
        </div>
      </div>

      <div className="glass grid gap-6 rounded-[28px] p-6 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Meta da semana
          </p>
          <h2 className="mt-3 text-2xl">Aumentar conversão para 18%</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Deixe a IA conduzir o funil e entre apenas quando o lead pedir preço
            final ou demonstrar dúvidas críticas.
          </p>
        </div>
        <div className="rounded-[24px] border border-white/50 bg-white/70 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Atalhos
          </p>
          <div className="mt-4 space-y-3 text-sm text-foreground">
            <div className="flex items-center justify-between">
              <span>Configurar WhatsApp</span>
              <span className="rounded-full bg-foreground px-3 py-1 text-xs text-white">
                Agora
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Ajustar prompt da IA</span>
              <span className="rounded-full bg-accent px-3 py-1 text-xs text-foreground">
                Revisar
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Ver leads comprados</span>
              <span className="text-xs text-muted-foreground">{stats.comprou}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
