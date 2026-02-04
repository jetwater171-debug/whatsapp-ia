import { getLeads } from "@/lib/data";
import { formatDateTime, formatPhone } from "@/lib/utils";

export default async function LeadsPage() {
  const leads = await getLeads();

  return (
    <section className="space-y-6">
      <header className="glass rounded-[28px] p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Leads
        </p>
        <h1 className="mt-3 text-3xl">Base completa de contatos</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Acompanhe status, tags e o último contato para priorizar ação humana.
        </p>
      </header>

      <div className="glass overflow-hidden rounded-[28px]">
        <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-4 border-b border-white/60 bg-white/60 px-6 py-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
          <span>Lead</span>
          <span>Status</span>
          <span>Última msg</span>
          <span>Criado</span>
        </div>
        {leads.length === 0 && (
          <div className="p-6 text-sm text-muted-foreground">
            Nenhum lead cadastrado ainda.
          </div>
        )}
        {leads.map((lead) => (
          <div
            key={lead.id}
            className="grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-4 border-b border-white/40 px-6 py-4 text-sm last:border-b-0"
          >
            <div>
              <p className="font-medium text-foreground">
                {lead.name ?? "Sem nome"}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatPhone(lead.phone)}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(lead.tags ?? []).map((tag: string) => (
                  <span
                    key={tag}
                    className="rounded-full bg-foreground/10 px-2 py-1 text-[10px] uppercase tracking-[0.3em] text-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs text-muted-foreground">
              {lead.status}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDateTime(lead.last_message_at)}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDateTime(lead.created_at)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
