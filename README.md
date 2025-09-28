# AI Note Taker

![Notespro logo](store/notespro.ico)

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create `.env.local` with the following values:

   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_google_gemini_key
   ```
   Or copy from `.env.example`.
3. Run the app:
   `npm run dev`

## Features

- **Secure authentication**: Google and GitHub OAuth via Supabase
- **Smart labels**: `#hashtags` in content become labels automatically
- **Filter and search**: Real-time search and label-based filtering
- **AI assistance (Gemini)**:
  - Generate initial note content in the creator
  - Inline per-note prompts to append AI-generated text
  - One-click actions to **Summarize** or **Improve writing** in the editor modal
  - Floating “Ask About Your Notes” chat that answers questions using your notes (RAG-style)
- **Color-coded notes**: Choose colors; selections persist
- **Responsive grid with animations**: Smooth interactions using Framer Motion

## Tech Stack

- **React** 19 + **TypeScript**
- **Redux Toolkit** 2 + **React-Redux** 9
- **Vite** 6 (dev/build)
- **Framer Motion** (animations)
- **Tailwind CSS** via CDN + Google Fonts (Poppins)
- **Supabase JS** v2 (database + OAuth)
- **Google Gemini** via `@google/genai`

## Project Structure

```
components/        UI components (Header, NoteCreator, NotesGrid, NoteModal, Sidebar, RagChat, NoteCard)
features/          Redux slices (auth, notes, filter, modal, theme)
services/          Supabase client and Gemini service
store/             Redux store wiring
lib/               Utilities and color helpers
index.tsx          App bootstrap
App.tsx            App layout and feature wiring
```

## Environment Variables

Create `.env.local` (or copy `.env.example`) with:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_google_gemini_key
```

Notes:
- The app uses `window.location.origin` for OAuth `redirectTo`.
- Keep your keys private; don’t commit `.env*` files.

## OAuth Setup (Supabase)

- Enable **Google** and optionally **GitHub** providers in Authentication > Providers
- Set the redirect URL to your app origin (e.g., `http://localhost:3000`)

## Supabase Database Setup

Run this SQL in your Supabase project's SQL editor to enable per-user notes with RLS:

```
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text,
  content text,
  labels text[],
  color text default 'default',
  user_id uuid references auth.users(id) on delete cascade
);

alter table public.notes enable row level security;

create policy "Users can view own notes" on public.notes
  for select using (auth.uid() = user_id);

create policy "Users can insert own notes" on public.notes
  for insert with check (auth.uid() = user_id);

create policy "Users can update own notes" on public.notes
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete own notes" on public.notes
  for delete using (auth.uid() = user_id);
```

Enable Google OAuth in Supabase Authentication > Providers and set the redirect to your app origin (e.g., `http://localhost:3000`). The app uses `window.location.origin` for `redirectTo`.

## NPM Scripts

- `npm run dev`: Start Vite dev server
- `npm run build`: Production build
- `npm run preview`: Preview production build

## Troubleshooting

- **“Database setup needed” errors in UI**: Run the SQL in this README (or the comment in `services/supabaseClient.ts`). Ensure `user_id` exists and RLS policies are applied.
- **Auth seems stuck after clicking sign-in**: Verify provider settings and redirect URL in Supabase match your app origin.
- **No notes shown after sign-in**: Confirm you’re authenticated and the `notes` table exists with correct policies.
