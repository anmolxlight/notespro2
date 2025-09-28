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
