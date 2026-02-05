"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState({
        telegram_bot_token: "",
        whatsapp_verify_token: "",
        whatsapp_access_token: "",
        whatsapp_phone_id: ""
    });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");
    const [showToken, setShowToken] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const res = await fetch("/api/admin/bot-settings");
        const data = await res.json();
        if (data) {
            setSettings({
                telegram_bot_token: data.telegram_bot_token || "",
                whatsapp_verify_token: data.whatsapp_verify_token || "",
                whatsapp_access_token: data.whatsapp_access_token || "",
                whatsapp_phone_id: data.whatsapp_phone_id || ""
            });
        }
    };

    const handleChange = (key: string, val: string) => {
        setSettings(prev => ({ ...prev, [key]: val }));
    }

    const saveSettings = async () => {
        setLoading(true);
        setMsg("");

        const res = await fetch("/api/admin/bot-settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(settings),
        });
        const data = await res.json();
        if (data?.error) {
            setMsg("Erro ao salvar: " + data.error);
        } else {
            setMsg("Configurações salvas com sucesso!");
        }
        setLoading(false);
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-24 right-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
                <div className="absolute bottom-0 left-10 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
            </div>

            <div className="relative mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10">
                <header className="flex flex-col gap-2">
                    <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Admin</p>
                    <h1 className="text-3xl font-semibold text-white">Configurações do Bot</h1>
                    <p className="text-sm text-slate-300">
                        Configure as credenciais do Telegram e WhatsApp.
                    </p>
                </header>

                <nav className="flex flex-wrap gap-2 rounded-full border border-white/10 bg-white/5 p-1 text-sm">
                    <Link href="/admin/insights" className="rounded-full px-3 py-1.5 text-slate-200 transition hover:bg-white/10">Insights</Link>
                    <Link href="/admin/scripts" className="rounded-full px-3 py-1.5 text-slate-200 transition hover:bg-white/10">Scripts</Link>
                    <Link href="/admin/previews" className="rounded-full px-3 py-1.5 text-slate-200 transition hover:bg-white/10">Prévias</Link>
                    <Link href="/admin/variants" className="rounded-full px-3 py-1.5 text-slate-200 transition hover:bg-white/10">Variações</Link>
                    <Link href="/admin/optimizer" className="rounded-full px-3 py-1.5 text-slate-200 transition hover:bg-white/10">IA</Link>
                    <Link href="/admin" className="rounded-full px-3 py-1.5 text-slate-200 transition hover:bg-white/10">Voltar</Link>
                </nav>

                <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/3 to-white/5 p-6 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.9)]">

                    {/* TELEGRAM */}
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold text-cyan-300 mb-4">Telegram (Antigo)</h2>
                        <div className="flex flex-col gap-3">
                            <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Bot Token</label>
                            <input
                                value={settings.telegram_bot_token}
                                onChange={(e) => handleChange('telegram_bot_token', e.target.value)}
                                type="password"
                                className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                            />
                        </div>
                    </div>

                    <div className="h-px bg-white/10 mb-8" />

                    {/* WHATSAPP */}
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold text-emerald-400 mb-4">WhatsApp Cloud API</h2>

                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Phone Number ID</label>
                                <input
                                    value={settings.whatsapp_phone_id}
                                    onChange={(e) => handleChange('whatsapp_phone_id', e.target.value)}
                                    type="text"
                                    placeholder="Ex: 362514..."
                                    className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Verify Token (Sua escolha)</label>
                                <input
                                    value={settings.whatsapp_verify_token}
                                    onChange={(e) => handleChange('whatsapp_verify_token', e.target.value)}
                                    type="text"
                                    placeholder="Ex: meu_token_seguro"
                                    className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Access Token (Permanente)</label>
                                <input
                                    value={settings.whatsapp_access_token}
                                    onChange={(e) => handleChange('whatsapp_access_token', e.target.value)}
                                    type="password"
                                    placeholder="EAAG..."
                                    className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <button
                            onClick={saveSettings}
                            disabled={loading}
                            className={`w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${loading
                                    ? "cursor-not-allowed bg-slate-700 text-slate-300"
                                    : "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                                }`}
                        >
                            {loading ? "Salvando..." : "Salvar Todas as Configurações"}
                        </button>
                    </div>

                    {msg && (
                        <div className={`mt-5 rounded-xl border px-4 py-3 text-sm ${msg.includes("Erro") ? "border-red-500/30 bg-red-500/10 text-red-200" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"}`}>
                            {msg}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

