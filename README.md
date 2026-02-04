# WhatsApp IA - MVP

Plataforma para integrar WhatsApp Business Cloud API, responder leads com IA (Gemini 2.5 Flash) e operar uma dashboard completa.

## Stack
- Next.js (App Router) + TypeScript
- Supabase (Postgres)
- Vercel (deploy)

## Setup

### 1) Instalar dependências
```bash
npm install
```

### 2) Variáveis de ambiente
Crie um arquivo `.env.local` com:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
WHATSAPP_VERIFY_TOKEN=
META_WHATSAPP_API_VERSION=v20.0
```

### 3) Supabase (SQL)
Execute os scripts abaixo no Supabase SQL Editor:
- `supabase/schema.sql`
- `supabase/rls.sql`

Se voce ja executou o schema antes, aplique tambem o indice unico em `wa_accounts.workspace_id`
para liberar o upsert da conexao do WhatsApp.

### 4) Rodar o projeto
```bash
npm run dev
```

## Webhook WhatsApp
Configure o webhook para:
```
POST /api/webhooks/whatsapp
GET /api/webhooks/whatsapp (verificação)
```

O token de verificação precisa ser igual a `WHATSAPP_VERIFY_TOKEN`.

## Deploy (Vercel)
- Configure as variáveis no painel da Vercel.
- Conecte o repositório GitHub.

## Scripts úteis
- `npm run dev`
- `npm run build`
- `npm run start`
