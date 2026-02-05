-- Migration: Add WhatsApp keys to bot_settings
-- This script inserts the necessary keys if they don't exist.

INSERT INTO bot_settings (key, value)
SELECT 'whatsapp_verify_token', ''
WHERE NOT EXISTS (SELECT 1 FROM bot_settings WHERE key = 'whatsapp_verify_token');

INSERT INTO bot_settings (key, value)
SELECT 'whatsapp_access_token', ''
WHERE NOT EXISTS (SELECT 1 FROM bot_settings WHERE key = 'whatsapp_access_token');

INSERT INTO bot_settings (key, value)
SELECT 'whatsapp_phone_id', ''
WHERE NOT EXISTS (SELECT 1 FROM bot_settings WHERE key = 'whatsapp_phone_id');

-- Ensure messages table supports WhatsApp IDs (usually phone numbers are stored in session)
-- We might need to add a column 'source' to sessions to distinguish Telegram from WhatsApp if not already planned.
-- For now, we assume 'telegram_chat_id' might be reused or we add a new column.
-- Let's add 'whatsapp_id' to sessions for clarity.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'whatsapp_id') THEN
        ALTER TABLE sessions ADD COLUMN whatsapp_id text;
        CREATE INDEX idx_sessions_whatsapp_id ON sessions(whatsapp_id);
    END IF;
END $$;
