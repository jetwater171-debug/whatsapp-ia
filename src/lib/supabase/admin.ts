import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

export const createSupabaseAdminClient = () => {
  if (!env.supabaseServiceRole || !env.supabaseUrl) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY nao configurada.");
  }

  return createClient(env.supabaseUrl, env.supabaseServiceRole, {
    auth: {
      persistSession: false,
    },
  });
};
