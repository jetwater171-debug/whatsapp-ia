import Link from "next/link";
import ConversationActions from "@/components/ConversationActions";
import { getConversationMessages, getConversations } from "@/lib/data";
import { formatDateTime, formatPhone } from "@/lib/utils";

export default async function InboxPage({
  searchParams,
}: {
  searchParams?: { conversation?: string };
}) {
  const conversations = await getConversations();
  const selectedId = searchParams?.conversation ?? conversations[0]?.id;
  const selectedConversation = conversations.find(
    (conversation) => conversation.id === selectedId
  );
  const messages = selectedId
    ? await getConversationMessages(selectedId)
    : [];

  return (
    <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div className="surface animate-enter p-4">
        <div className="flex items-center justify-between px-2 pb-4">
          <div>
            <p className="eyebrow">Conversas</p>
            <h2 className="text-lg">Inbox</h2>
          </div>
        </div>
        <div className="space-y-3">
          {conversations.length === 0 && (
            <div className="rounded-2xl border border-dashed border-foreground/10 p-4 text-xs text-muted-foreground">
              Nenhuma conversa ainda.
            </div>
          )}
          {conversations.map((conversation) => {
            const lead = Array.isArray(conversation.leads)
              ? conversation.leads[0]
              : conversation.leads;
            const active = conversation.id === selectedId;
            return (
              <Link
                key={conversation.id}
                href={`/inbox?conversation=${conversation.id}`}
                className={`block rounded-2xl border p-4 text-sm transition ${
                  active
                    ? "border-foreground/20 bg-white shadow-[0_18px_45px_-35px_rgba(15,23,42,0.45)]"
                    : "border-transparent bg-white/70 hover:border-foreground/10 hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-foreground">
                    {lead?.name ?? "Lead sem nome"}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {lead?.status ?? "novo"}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatPhone(lead?.phone)}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {formatDateTime(conversation.last_message_at)}
                </p>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-foreground px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-white">
                  {conversation.ai_enabled ? "IA ativa" : "IA pausada"}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      <div className="surface animate-enter p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Conversa</p>
            <h2 className="text-2xl">Historico</h2>
          </div>
          <ConversationActions
            conversationId={selectedConversation?.id}
            aiEnabled={selectedConversation?.ai_enabled}
          />
        </div>
        <div className="mt-6 flex min-h-[420px] flex-1 flex-col gap-4 overflow-y-auto">
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
