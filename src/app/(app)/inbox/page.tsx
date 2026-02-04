import Link from "next/link";
import { getConversationMessages, getConversations } from "@/lib/data";
import { formatDateTime, formatPhone } from "@/lib/utils";

export default async function InboxPage({
  searchParams,
}: {
  searchParams?: { conversation?: string };
}) {
  const conversations = await getConversations();
  const selectedId = searchParams?.conversation ?? conversations[0]?.id;
  const messages = selectedId
    ? await getConversationMessages(selectedId)
    : [];

  return (
    <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div className="glass rounded-[28px] p-4">
        <div className="flex items-center justify-between px-2 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Conversas
            </p>
            <h2 className="text-lg">Inbox</h2>
          </div>
        </div>
        <div className="space-y-3">
          {conversations.length === 0 && (
            <div className="rounded-2xl border border-dashed border-foreground/10 p-4 text-xs text-muted-foreground">
              Nenhuma conversa ainda.
            </div>
          )}
          {conversations.map((conversation) => (
            <Link
              key={conversation.id}
              href={`/inbox?conversation=${conversation.id}`}
              className={`block rounded-2xl border p-4 text-sm transition ${
                conversation.id === selectedId
                  ? "border-foreground/20 bg-white"
                  : "border-transparent bg-white/70 hover:border-foreground/10"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="font-medium text-foreground">
                  {conversation.leads?.name ?? "Lead sem nome"}
                </p>
                <span className="text-xs text-muted-foreground">
                  {conversation.leads?.status ?? "novo"}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {formatPhone(conversation.leads?.phone)}
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                {formatDateTime(conversation.last_message_at)}
              </p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-foreground px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-white">
                {conversation.ai_enabled ? "IA ativa" : "IA pausada"}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="glass flex min-h-[420px] flex-col rounded-[28px] p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Conversa
            </p>
            <h2 className="text-2xl">Histórico</h2>
          </div>
          <button className="rounded-full bg-foreground px-4 py-2 text-xs text-white">
            Assumir conversa
          </button>
        </div>
        <div className="mt-6 flex flex-1 flex-col gap-4 overflow-y-auto">
          {messages.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Selecione uma conversa para ver as mensagens.
            </p>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[70%] rounded-[20px] px-4 py-3 text-sm ${
                message.direction === "out"
                  ? "ml-auto bg-foreground text-white"
                  : "bg-white text-foreground"
              }`}
            >
              <p>{message.content}</p>
              <p className="mt-2 text-[10px] uppercase tracking-[0.3em] opacity-60">
                {formatDateTime(message.created_at)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
