-- ====================================================================================
-- MASTER SETUP SCRIPT FOR WHATSAPP-IA
-- ====================================================================================
-- Run this script in the Supabase SQL Editor to set up the database tables and columns.
-- This combined script includes:
-- 1. Base Schema (Tables: sessions, messages, bot_settings, etc.)
-- 2. WhatsApp Migrations (Columns for WhatsApp ID and Keys)
-- 3. Prompt Management (Bandit Algorithms)
-- 4. Preview Assets (Media management)
-- 5. Security Policies (RLS)
-- ====================================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    telegram_chat_id TEXT UNIQUE, 
    whatsapp_id TEXT, -- Added for WhatsApp
    user_city TEXT,
    device_type TEXT,
    status TEXT DEFAULT 'active', -- active, paused (admin taking over), closed
    lead_score JSONB,
    user_name TEXT,
    total_paid NUMERIC DEFAULT 0,
    funnel_step TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    last_bot_activity_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    reengagement_sent BOOLEAN DEFAULT FALSE,
    processing_token TEXT
);

-- Index for WhatsApp ID
CREATE INDEX IF NOT EXISTS idx_sessions_whatsapp_id ON sessions(whatsapp_id);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    sender TEXT NOT NULL, -- 'user', 'bot', 'system', 'admin', 'thought'
    content TEXT,
    media_url TEXT,
    media_type TEXT, -- 'image', 'video', 'audio'
    payment_data JSONB -- Stores payment info if related to payment
);

-- Create bot_settings table
CREATE TABLE IF NOT EXISTS bot_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- 3. SEED SETTINGS (Insert default empty keys if not exist)
INSERT INTO bot_settings (key, value) VALUES ('telegram_bot_token', '') ON CONFLICT (key) DO NOTHING;
INSERT INTO bot_settings (key, value) VALUES ('whatsapp_verify_token', '') ON CONFLICT (key) DO NOTHING;
INSERT INTO bot_settings (key, value) VALUES ('whatsapp_access_token', '') ON CONFLICT (key) DO NOTHING;
INSERT INTO bot_settings (key, value) VALUES ('whatsapp_phone_id', '') ON CONFLICT (key) DO NOTHING;

-- 4. PROMPT & ASSETS

-- Dynamic prompt blocks (editable without deploy)
CREATE TABLE IF NOT EXISTS prompt_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    label TEXT,
    content TEXT NOT NULL,
    enabled BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Prompt variants for automatic learning (bandit)
CREATE TABLE IF NOT EXISTS prompt_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stage TEXT NOT NULL,
    label TEXT,
    content TEXT NOT NULL,
    enabled BOOLEAN DEFAULT true,
    weight NUMERIC DEFAULT 1,
    successes INTEGER DEFAULT 0,
    failures INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS variant_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES prompt_variants(id) ON DELETE CASCADE,
    stage TEXT NOT NULL,
    success BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Funnel events for analytics
CREATE TABLE IF NOT EXISTS funnel_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    step TEXT NOT NULL,
    source TEXT DEFAULT 'ai',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Preview assets (midias de previa configuraveis pelo admin)
CREATE TABLE IF NOT EXISTS preview_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    triggers TEXT,
    tags TEXT[],
    stage TEXT DEFAULT 'PREVIEW',
    min_tarado INTEGER DEFAULT 0,
    max_tarado INTEGER DEFAULT 100,
    media_type TEXT NOT NULL, -- image | video
    media_url TEXT NOT NULL,
    storage_path TEXT,
    priority INTEGER DEFAULT 0,
    enabled BOOLEAN DEFAULT true
);

-- 5. REALTIME

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'messages') THEN
        alter publication supabase_realtime add table messages;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'sessions') THEN
        alter publication supabase_realtime add table sessions;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'prompt_blocks') THEN
        alter publication supabase_realtime add table prompt_blocks;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'prompt_variants') THEN
        alter publication supabase_realtime add table prompt_variants;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'variant_assignments') THEN
        alter publication supabase_realtime add table variant_assignments;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'funnel_events') THEN
        alter publication supabase_realtime add table funnel_events;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'preview_assets') THEN
        alter publication supabase_realtime add table preview_assets;
    END IF;
END $$;

-- 6. RLS (SECURITY)

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE variant_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnel_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE preview_assets ENABLE ROW LEVEL SECURITY;

-- Creating policies only if they don't exist is tricky in SQL, so we use DROP IF EXISTS first to be idempotent.
DROP POLICY IF EXISTS "Enable read/write for all" ON sessions;
DROP POLICY IF EXISTS "Enable read/write for all" ON messages;
DROP POLICY IF EXISTS "Enable read/write for all" ON prompt_blocks;
DROP POLICY IF EXISTS "Enable read/write for all" ON prompt_variants;
DROP POLICY IF EXISTS "Enable read/write for all" ON variant_assignments;
DROP POLICY IF EXISTS "Enable read/write for all" ON funnel_events;
DROP POLICY IF EXISTS "Enable read/write for all" ON preview_assets;

-- Allow everything for everyone (Public access for demo/dev purposes)
-- In production, restrict this.
CREATE POLICY "Enable read/write for all" ON sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable read/write for all" ON messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable read/write for all" ON prompt_blocks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable read/write for all" ON prompt_variants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable read/write for all" ON variant_assignments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable read/write for all" ON funnel_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable read/write for all" ON preview_assets FOR ALL USING (true) WITH CHECK (true);

-- Protect Bot Settings (Only service role should write freely, but for admin panel we might need access)
-- Assuming admin panel uses Service Role or Authenticated user.
-- For simple setup, we keep it protected but allow select if needed for debugging? No, keep strict.
DROP POLICY IF EXISTS "Deny all anon" ON bot_settings;
CREATE POLICY "Deny all anon" ON bot_settings FOR ALL USING (false) WITH CHECK (false);

-- 7. STORAGE
-- Make sure 'previews' bucket exists (Needs to be done via API or Dashboard usually, SQL cannot always create buckets in Supabase Storage directly).
-- But we can add policies assuming it exists.

INSERT INTO storage.buckets (id, name, public) VALUES ('previews', 'previews', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read previews" ON storage.objects;
DROP POLICY IF EXISTS "Public insert previews" ON storage.objects;
DROP POLICY IF EXISTS "Public delete previews" ON storage.objects;

CREATE POLICY "Public read previews" ON storage.objects FOR SELECT USING (bucket_id = 'previews');
CREATE POLICY "Public insert previews" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'previews');
CREATE POLICY "Public delete previews" ON storage.objects FOR DELETE USING (bucket_id = 'previews');

-- FINISHED
