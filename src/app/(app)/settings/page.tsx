"use client";

import { useEffect, useState } from "react";

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

  useEffect(() => {
    const load = async () => {
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
      }

      if (aiRes.ok) {
        const data = await aiRes.json();
        setAiSettings({
          systemPrompt: data.systemPrompt ?? "",
          temperature: data.temperature ?? 0.4,
          model: data.model ?? "gemini-2.5-flash",
        });
      }
    };

    load();
  }, []);

  const saveWhatsApp = async () => {
    setWaStatus("saving");
    try {
      const res = await fetch("/api/settings/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(waSettings),
      });
      if (!res.ok) throw new Error("Erro");
      setWaStatus("saved");
    } catch {
      setWaStatus("error");
    }
  };

  const saveAi = async () => {
    setAiStatus("saving");
    try {
      const res = await fetch("/api/settings/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(aiSettings),
      });
      if (!res.ok) throw new Error("Erro");
      setAiStatus("saved");
    } catch {
      setAiStatus("error");
    }
  };

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
                value={waSettings.accessToken}
                onChange={(event) =>
                  setWaSettings((prev) => ({
                    ...prev,
                    accessToken: event.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Phone Number ID
              </label>
              <input
                className="mt-2 w-full rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm"
                placeholder="123456789"
                value={waSettings.phoneNumberId}
                onChange={(event) =>
                  setWaSettings((prev) => ({
                    ...prev,
                    phoneNumberId: event.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Número exibido (opcional)
              </label>
              <input
                className="mt-2 w-full rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm"
                placeholder="+55 11 99999-0000"
                value={waSettings.displayPhoneNumber}
                onChange={(event) =>
                  setWaSettings((prev) => ({
                    ...prev,
                    displayPhoneNumber: event.target.value,
                  }))
                }
              />
            </div>
            <button
              onClick={saveWhatsApp}
              className="rounded-full bg-foreground px-4 py-2 text-xs text-white"
            >
              {waStatus === "saving" ? "Salvando..." : "Salvar conexão"}
            </button>
            {waStatus === "saved" && (
              <p className="text-xs text-foreground">Conexão salva.</p>
            )}
            {waStatus === "error" && (
              <p className="text-xs text-danger">Erro ao salvar.</p>
            )}
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
              value={aiSettings.systemPrompt}
              onChange={(event) =>
                setAiSettings((prev) => ({
                  ...prev,
                  systemPrompt: event.target.value,
                }))
              }
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Modelo</span>
              <span className="text-foreground">{aiSettings.model}</span>
            </div>
            <button
              onClick={saveAi}
              className="rounded-full bg-accent px-4 py-2 text-xs text-foreground"
            >
              {aiStatus === "saving" ? "Salvando..." : "Atualizar prompt"}
            </button>
            {aiStatus === "saved" && (
              <p className="text-xs text-foreground">Prompt atualizado.</p>
            )}
            {aiStatus === "error" && (
              <p className="text-xs text-danger">Erro ao salvar.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
