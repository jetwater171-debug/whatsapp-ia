import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/env";

const empty = {
  stats: {
    totalLeads: 0,
    novos: 0,
    comprou: 0,
    intervencao: 0,
  },
  leads: [],
  conversations: [],
};

export type DashboardStats = typeof empty.stats;

export const getDashboardStats = async () => {
  if (!hasSupabaseConfig) return empty.stats;

  const supabase = await createSupabaseServerClient();
  const { count: totalLeads } = await supabase.from("leads").select("id", { count: "exact", head: true });
  const { count: novos } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("status", "novo");
  const { count: comprou } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("status", "comprou");
  const { count: intervencao } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("status", "precisa_intervir");

  return {
    totalLeads: totalLeads ?? 0,
    novos: novos ?? 0,
    comprou: comprou ?? 0,
    intervencao: intervencao ?? 0,
  };
};

export const getLeads = async () => {
  if (!hasSupabaseConfig) return empty.leads;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("leads")
    .select("id,name,phone,status,tags,last_message_at,created_at")
    .order("last_message_at", { ascending: false })
    .limit(50);
  return data ?? [];
};

export const getConversations = async () => {
  if (!hasSupabaseConfig) return empty.conversations;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("conversations")
    .select("id,lead_id,last_message_at,ai_enabled,leads(name,phone,status)")
    .order("last_message_at", { ascending: false })
    .limit(40);
  return data ?? [];
};

export const getConversationMessages = async (conversationId: string) => {
  if (!hasSupabaseConfig) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("messages")
    .select("id,content,direction,created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(50);
  return data ?? [];
};
