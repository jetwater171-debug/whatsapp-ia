"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("sending");

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-sm"
          placeholder="voce@empresa.com"
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-full bg-foreground px-4 py-2 text-xs uppercase tracking-[0.3em] text-white"
      >
        {status === "sending" ? "Enviando..." : "Enviar link mágico"}
      </button>
      {status === "sent" && (
        <p className="text-xs text-foreground">
          Link enviado! Verifique seu email.
        </p>
      )}
      {status === "error" && (
        <p className="text-xs text-danger">Não foi possível enviar. Tente novamente.</p>
      )}
    </form>
  );
}
