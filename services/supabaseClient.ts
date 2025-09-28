
import { createClient } from '@supabase/supabase-js';

// Use Vite's static env replacement to ensure values are injected at build/serve time
const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = import.meta.env;
const supabaseUrl = VITE_SUPABASE_URL;
const supabaseAnonKey = VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Provide a clear runtime error to guide setup
  // eslint-disable-next-line no-console
  console.error(
    "Missing Supabase environment variables. Please set 'VITE_SUPABASE_URL' and 'VITE_SUPABASE_ANON_KEY' in your .env file."
  );
}

export const supabase = createClient(supabaseUrl as string, supabaseAnonKey as string);

/*
  Supabase table schema for this project (with per-user notes).
  Execute this SQL in your Supabase project's SQL editor.

  -- 1) Create table (fresh install)
  -- If you already have a `notes` table, skip to step 2.
  create table if not exists notes (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default now(),
    title text,
    content text,
    labels text[],
    color text default 'default',
    user_id uuid references auth.users(id)
  );

  -- 2) If your table exists but is missing the user_id column, add it
  alter table notes add column if not exists user_id uuid references auth.users(id);
  create index if not exists notes_user_id_idx on notes(user_id);

  -- 3) Enable Row Level Security (RLS)
  alter table notes enable row level security;

  -- 4) Restrictive, per-user policies
  drop policy if exists "Public notes are viewable by everyone." on notes;
  drop policy if exists "Anyone can insert notes." on notes;
  drop policy if exists "Anyone can update their own notes." on notes;
  drop policy if exists "Anyone can delete their own notes." on notes;

  create policy "Users can view their notes"
    on notes for select
    using (auth.uid() = user_id);

  create policy "Users can insert their notes"
    on notes for insert
    with check (auth.uid() = user_id);

  create policy "Users can update their notes"
    on notes for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

  create policy "Users can delete their notes"
    on notes for delete
    using (auth.uid() = user_id);

  -- 5) Optional GIN index for labels search
  create index if not exists notes_labels_gin_idx on notes using gin(labels);

  -- Note: after altering schema, the PostgREST schema cache may take up to ~1 minute to refresh.
  -- You can also trigger a "Reload schema cache" from the Database > Settings panel.
*/