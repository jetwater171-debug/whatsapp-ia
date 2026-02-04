"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { clientEnv } from "@/lib/client-env";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const canLogin = clientEnv.hasSupabaseConfig;

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canLogin) return;

    setStatus("sending");
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (authError) throw authError;
      setStatus("sent");
    } catch (err) {
      setStatus("idle");
      setError(
        err instanceof Error
          ? err.message
          : "Nao foi possivel enviar. Tente novamente."
      );
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {!canLogin && (
        <div className="callout callout-warning">
          Configure `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
          para liberar o login.
        </div>
      )}
      <div>
        <label className="label">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="input"
          placeholder="voce@empresa.com"
          disabled={!canLogin || status === "sending"}
        />
      </div>
      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={!canLogin || status === "sending"}
      >
        {status === "sending" ? "Enviando..." : "Enviar link magico"}
      </button>
      {status === "sent" && (
        <p className="text-xs text-foreground">
          Link enviado! Verifique seu email.
        </p>
      )}
      {error && <p className="text-xs text-danger">{error}</p>}
    </form>
  );
}
