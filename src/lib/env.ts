export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceRole: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  whatsappVerifyToken: process.env.WHATSAPP_VERIFY_TOKEN ?? "",
  metaApiVersion: process.env.META_WHATSAPP_API_VERSION ?? "v20.0",
};

export const hasSupabaseConfig = Boolean(
  env.supabaseUrl && env.supabaseAnonKey
);

export const hasServiceRole = Boolean(
  env.supabaseUrl && env.supabaseServiceRole
);

export const hasGeminiKey = Boolean(env.geminiApiKey);
