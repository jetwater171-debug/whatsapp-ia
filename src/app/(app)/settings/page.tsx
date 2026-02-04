"use client";

import { useEffect, useMemo, useState } from "react";
import { clientEnv } from "@/lib/client-env";

type Status = "idle" | "saving" | "saved" | "error";

type WhatsAppSettings = {
  accessToken: string;
  phoneNumberId: string;
  displayPhoneNumber: string;
};

type AiSettings = {
  systemPrompt: string;
  temperature: number;
  model: string;
};

const readError = async (res: Response) => {
  try {
    const data = await res.json();
    return data?.error ?? null;
  } catch {
    return null;
  }
};

export default function SettingsPage() {
  const [waSettings, setWaSettings] = useState<WhatsAppSettings>({
    accessToken: "",
    phoneNumberId: "",
    displayPhoneNumber: "",
  });
  const [aiSettings, setAiSettings] = useState<AiSettings>({
    systemPrompt: "",
    temperature: 0.4,
    model: "gemini-2.5-flash",
  });
  const [waStatus, setWaStatus] = useState<Status>("idle");
  const [aiStatus, setAiStatus] = useState<Status>("idle");
  const [waError, setWaError] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showToken, setShowToken] = useState(false);

  const canUseSupabase = clientEnv.hasSupabaseConfig;
  const tokenPreview = useMemo(() => {
    if (!waSettings.accessToken) return "-";
    const trimmed = waSettings.accessToken.trim();
    if (trimmed.length <= 8) return trimmed;
    return `${trimmed.slice(0, 6)}...${trimmed.slice(-4)}`;
  }, [waSettings.accessToken]);

  useEffect(() => {
    const load = async () => {
      if (!canUseSupabase) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setWaError(null);
      setAiError(null);

      const [waRes, aiRes] = await Promise.all([
        fetch("/api/settings/whatsapp"),
        fetch("/api/settings/ai"),
      ]);

      if (waRes.ok) {
        const data = await waRes.json();
        setWaSettings({
          accessToken: data.accessToken ?? "",
          phoneNumberId: data.phoneNumberId ?? "",
          displayPhoneNumber: data.displayPhoneNumber ?? "",
        });
      } else {
        const error = await readError(waRes);
        setWaError(error ?? "Nao foi possivel carregar a conexao do WhatsApp.");
      }

      if (aiRes.ok) {
        const data = await aiRes.json();
        setAiSettings({
          systemPrompt: data.systemPrompt ?? "",
          temperature: data.temperature ?? 0.4,
          model: data.model ?? "gemini-2.5-flash",
        });
      } else {
        const error = await readError(aiRes);
        setAiError(error ?? "Nao foi possivel carregar as configuracoes da IA.");
      }

      setLoading(false);
    };

    load();
  }, [canUseSupabase]);

  const saveWhatsApp = async () => {
    setWaStatus("saving");
    setWaError(null);
    if (!canUseSupabase) {
      setWaStatus("error");
      setWaError("Configure o Supabase antes de salvar.");
      return;
    }

    try {
      const res = await fetch("/api/settings/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(waSettings),
      });

      if (!res.ok) {
        const error = await readError(res);
        throw new Error(error ?? "Erro ao salvar.");
      }

      setWaStatus("saved");
    } catch (err) {
      setWaStatus("error");
      setWaError(err instanceof Error ? err.message : "Erro ao salvar.");
    }
  };

  const saveAi = async () => {
    setAiStatus("saving");
    setAiError(null);
    if (!canUseSupabase) {
      setAiStatus("error");
      setAiError("Configure o Supabase antes de salvar.");
      return;
    }

    try {
      const res = await fetch("/api/settings/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(aiSettings),
      });
      if (!res.ok) {
        const error = await readError(res);
        throw new Error(error ?? "Erro ao salvar.");
      }
      setAiStatus("saved");
    } catch (err) {
      setAiStatus("error");
      setAiError(err instanceof Error ? err.message : "Erro ao salvar.");
    }
  };

  return (
    <section className="space-y-6">
      <header className="surface-strong animate-enter p-6">
        <p className="eyebrow">Configuracoes</p>
        <h1 className="mt-4 text-3xl text-balance">Operacao e IA</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Conecte o WhatsApp, ajuste o prompt e controle o modo autonomo.
        </p>
      </header>

      {!canUseSupabase && (
        <div className="callout callout-warning">
          Para editar configuracoes, defina `NEXT_PUBLIC_SUPABASE_URL`.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="surface animate-rise p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl">Conta WhatsApp</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Use o token e o Phone Number ID do Meta WhatsApp Cloud API.
              </p>
            </div>
            <div className="chip">Token {tokenPreview}</div>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="label">Access Token</label>
              <div className="mt-2 flex gap-2">
                <input
                  className="input"
                  placeholder="EAAJ..."
                  value={waSettings.accessToken}
                  onChange={(event) =>
                    setWaSettings((prev) => ({
                      ...prev,
                      accessToken: event.target.value,
                    }))
                  }
                  type={showToken ? "text" : "password"}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="btn btn-outline px-4"
                  onClick={() => setShowToken((prev) => !prev)}
                  disabled={loading}
                >
                  {showToken ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>
            <div>
              <label className="label">Phone Number ID</label>
              <input
                className="input"
                placeholder="123456789"
                value={waSettings.phoneNumberId}
                onChange={(event) =>
                  setWaSettings((prev) => ({
                    ...prev,
                    phoneNumberId: event.target.value,
                  }))
                }
                disabled={loading}
              />
            </div>
            <div>
              <label className="label">Numero exibido (opcional)</label>
              <input
                className="input"
                placeholder="+55 11 99999-0000"
                value={waSettings.displayPhoneNumber}
                onChange={(event) =>
                  setWaSettings((prev) => ({
                    ...prev,
                    displayPhoneNumber: event.target.value,
                  }))
                }
                disabled={loading}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={saveWhatsApp}
                className="btn btn-primary"
                disabled={
                  waStatus === "saving" ||
                  loading ||
                  !waSettings.accessToken ||
                  !waSettings.phoneNumberId
                }
              >
                {waStatus === "saving" ? "Salvando..." : "Salvar conexao"}
              </button>
              {waStatus === "saved" && (
                <span className="text-xs text-foreground">
                  Conexao salva com sucesso.
                </span>
              )}
              {waStatus === "error" && waError && (
                <span className="text-xs text-danger">{waError}</span>
              )}
            </div>
          </div>
        </div>

        <div className="surface animate-rise p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl">Prompt da IA</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Defina como a IA deve abordar o lead no funil.
              </p>
            </div>
            <div className="chip">{aiSettings.model}</div>
          </div>
          <div className="mt-5 space-y-4">
            <textarea
              className="textarea"
              placeholder="Voce e um consultor de vendas..."
              value={aiSettings.systemPrompt}
              onChange={(event) =>
                setAiSettings((prev) => ({
                  ...prev,
                  systemPrompt: event.target.value,
                }))
              }
              disabled={loading}
            />
            <div className="grid gap-4 md:grid-cols-[1fr_140px]">
              <div>
                <label className="label">Modelo</label>
                <input
                  className="input"
                  value={aiSettings.model}
                  onChange={(event) =>
                    setAiSettings((prev) => ({
                      ...prev,
                      model: event.target.value,
                    }))
                  }
                  disabled={loading}
                />
              </div>
              <div>
                <label className="label">Temperatura</label>
                <input
                  className="input"
                  type="number"
                  min={0}
                  max={1}
                  step={0.1}
                  value={aiSettings.temperature}
                  onChange={(event) =>
                    setAiSettings((prev) => ({
                      ...prev,
                      temperature: Number(event.target.value),
                    }))
                  }
                  disabled={loading}
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={saveAi}
                className="btn btn-accent"
                disabled={aiStatus === "saving" || loading || !aiSettings.systemPrompt}
              >
                {aiStatus === "saving" ? "Salvando..." : "Atualizar prompt"}
              </button>
              {aiStatus === "saved" && (
                <span className="text-xs text-foreground">Prompt atualizado.</span>
              )}
              {aiStatus === "error" && aiError && (
                <span className="text-xs text-danger">{aiError}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
