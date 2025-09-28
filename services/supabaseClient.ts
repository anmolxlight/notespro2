
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pezsekqgdlrayicrbrfl.supabase.co'; 
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlenNla3FnZGxyYXlpY3JicmZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMzQ1MDMsImV4cCI6MjA2MzYxMDUwM30.I6bCEVCe19_GwnKvBof1kMuL9BGNHqyUdoTLPBck7Ko';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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