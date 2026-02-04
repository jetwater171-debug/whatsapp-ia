create extension if not exists "pgcrypto";

create type lead_status as enum ('novo', 'em_conversa', 'comprou', 'precisa_intervir');
create type message_direction as enum ('in', 'out');
create type intervention_status as enum ('open', 'resolved');

create table if not exists workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_user_id uuid,
  created_at timestamptz default now()
);

create table if not exists workspace_members (
  workspace_id uuid references workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text default 'admin',
  created_at timestamptz default now(),
  primary key (workspace_id, user_id)
);

create table if not exists wa_accounts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  provider text default 'meta',
  access_token text,
  app_id text,
  app_secret text,
  created_at timestamptz default now()
);

create table if not exists wa_numbers (
  id uuid primary key default gen_random_uuid(),
  wa_account_id uuid references wa_accounts(id) on delete cascade,
  phone_number_id text unique,
  display_phone_number text,
  status text,
  created_at timestamptz default now()
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  name text,
  phone text,
  status lead_status default 'novo',
  tags text[] default array[]::text[],
  last_message_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  lead_id uuid references leads(id) on delete cascade,
  wa_number_id uuid references wa_numbers(id) on delete cascade,
  last_message_at timestamptz,
  ai_enabled boolean default true,
  created_at timestamptz default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade,
  direction message_direction,
  content text,
  media_url text,
  status text,
  provider_message_id text unique,
  created_at timestamptz default now()
);

create table if not exists ai_settings (
  workspace_id uuid references workspaces(id) on delete cascade primary key,
  model text,
  temperature numeric,
  system_prompt text,
  enabled boolean default true,
  created_at timestamptz default now()
);

create table if not exists interventions (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade,
  reason text,
  status intervention_status default 'open',
  created_at timestamptz default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  type text,
  payload_json jsonb,
  created_at timestamptz default now()
);

create index if not exists leads_phone_idx on leads(phone);
create index if not exists messages_provider_idx on messages(provider_message_id);
create index if not exists messages_conversation_idx on messages(conversation_id, created_at);
create unique index if not exists wa_accounts_workspace_idx on wa_accounts(workspace_id);
