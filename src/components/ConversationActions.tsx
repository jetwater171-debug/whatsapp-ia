"use client";

import { useEffect, useState } from "react";

type Status = "idle" | "saving" | "error";

export default function ConversationActions({
  conversationId,
  aiEnabled,
}: {
  conversationId?: string;
  aiEnabled?: boolean;
}) {
  const [enabled, setEnabled] = useState(aiEnabled ?? true);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!conversationId) {
      setEnabled(true);
      setStatus("idle");
      setError(null);
      return;
    }

    setEnabled(typeof aiEnabled === "boolean" ? aiEnabled : true);
    setStatus("idle");
    setError(null);
  }, [aiEnabled, conversationId]);

  const toggleAi = async () => {
    if (!conversationId) return;
    setStatus("saving");
    setError(null);

    try {
      const res = await fetch("/api/conversations/toggle-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          enabled: !enabled,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Erro ao atualizar conversa.");
      }

      setEnabled((prev) => !prev);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error ? err.message : "Erro ao atualizar conversa."
      );
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        className="btn btn-primary"
        onClick={toggleAi}
        disabled={!conversationId || status === "saving"}
      >
        {status === "saving"
          ? "Atualizando..."
          : enabled
          ? "Assumir conversa"
          : "Devolver a IA"}
      </button>
      <span className="chip">{enabled ? "IA ativa" : "IA pausada"}</span>
      {status === "error" && error && (
        <span className="text-xs text-danger">{error}</span>
      )}
    </div>
  );
}
