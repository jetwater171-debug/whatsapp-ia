export default function SettingsPage() {
  return (
    <section className="space-y-6">
      <header className="glass rounded-[28px] p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Configurações
        </p>
        <h1 className="mt-3 text-3xl">Operação e IA</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Conecte o WhatsApp, ajuste o prompt e controle o modo autônomo.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-[28px] p-6">
          <h2 className="text-xl">Conta WhatsApp</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Use o token e o Phone Number ID do Meta WhatsApp Cloud API.
          </p>
          <div className="mt-4 space-y-3">
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Access Token
              </label>
              <input
                className="mt-2 w-full rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm"
                placeholder="EAAJ..."
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Phone Number ID
              </label>
              <input
                className="mt-2 w-full rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm"
                placeholder="123456789"
              />
            </div>
            <button className="rounded-full bg-foreground px-4 py-2 text-xs text-white">
              Salvar conexão
            </button>
          </div>
        </div>

        <div className="glass rounded-[28px] p-6">
          <h2 className="text-xl">Prompt da IA</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Defina como a IA deve abordar o lead no funil.
          </p>
          <div className="mt-4 space-y-3">
            <textarea
              className="min-h-[160px] w-full rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm"
              placeholder="Você é um consultor de vendas..."
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Modelo</span>
              <span className="text-foreground">Gemini 2.5 Flash</span>
            </div>
            <button className="rounded-full bg-accent px-4 py-2 text-xs text-foreground">
              Atualizar prompt
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
