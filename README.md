# Vocera Connect

AI-powered outbound voice calling platform for managing call campaigns — build contact lists, launch automated voice campaigns, and track call outcomes in real time.

## What it does

Vocera Connect lets you run outbound voice-call campaigns without a human dialer:

- **Campaigns** — create, edit, and manage calling campaigns, each with its own contact list and call script
- **Automated calling** — campaigns place outbound calls through the [Botnoi Voice API](https://botnoi.ai/), using configurable AI voices and scripts
- **Contact management** — add and track contacts per campaign, with per-contact call status (`confirmed`, `rejected`, `missed`, `pending`)
- **Call flow builder** — configure call defaults and conversation flow via a visual flow editor
- **Analytics dashboard** — monitor campaign performance and call outcomes at a glance
- **Auth** — login/register to manage campaigns per account

## Tech stack

**Frontend**
- [React 19](https://react.dev/) + [TanStack Start](https://tanstack.com/start) (full-stack React framework) + [TanStack Router](https://tanstack.com/router)
- [TanStack Query](https://tanstack.com/query) for data fetching/caching
- [Tailwind CSS v4](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/) primitives (shadcn-style components)
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) for form handling/validation
- [@xyflow/react](https://reactflow.dev/) for the visual call-flow builder
- [Recharts](https://recharts.org/) for analytics charts

**Backend**
- [Supabase](https://supabase.com/) — Postgres database, auth, and Edge Functions
- `botnoi-outbound` Supabase Edge Function bridges to the Botnoi Voice API to place calls

**Tooling**
- Vite 7, ESLint, Prettier, TypeScript

## Project structure

```
src/
├── routes/          # Pages: dashboard, campaigns, contacts, analytics, settings, auth
├── components/       # UI components
├── services/          # botnoiService.ts – outbound calling logic
├── hooks/            # React hooks
├── lib/              # Supabase client, utilities
└── server.ts          # TanStack Start server entry

supabase/
├── functions/
│   └── botnoi-outbound/  # Edge Function that triggers Botnoi voice calls
└── migrations/            # Database schema
```

## Getting started

```bash
# install dependencies
bun install   # or npm install

# copy env template and fill in your Supabase project credentials
cp .env.example .env

# start the dev server
bun run dev
```

### Environment variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public API key |

### Available scripts

| Command | Description |
|---|---|
| `bun run dev` | Start the dev server |
| `bun run build` | Production build |
| `bun run preview` | Preview the production build locally |
| `bun run lint` | Run ESLint |
| `bun run format` | Format code with Prettier |
