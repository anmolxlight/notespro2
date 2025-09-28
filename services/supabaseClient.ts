
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
  Supabase table schema for this project.
  Execute this SQL in your Supabase project's SQL editor.

  -- 1. Create the table
  CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    title TEXT,
    content TEXT,
    labels TEXT[],
    color TEXT DEFAULT 'default'
  );

  -- 2. Enable Row Level Security (RLS)
  ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

  -- 3. Create policies for public access (since this app has no user auth)
  -- This allows anyone to do anything. For a production app with users,
  -- you would write policies based on user IDs (e.g., auth.uid()).

  CREATE POLICY "Public notes are viewable by everyone." 
    ON notes FOR SELECT USING (true);

  CREATE POLICY "Anyone can insert notes." 
    ON notes FOR INSERT WITH CHECK (true);

  CREATE POLICY "Anyone can update their own notes." 
    ON notes FOR UPDATE USING (true) WITH CHECK (true);

  CREATE POLICY "Anyone can delete their own notes." 
    ON notes FOR DELETE USING (true);

*/