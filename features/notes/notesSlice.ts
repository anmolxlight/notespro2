
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Note } from '../../types';
import type { RootState } from '../../store/store';
import { store } from '../../store/store';
import { supabase } from '../../services/supabaseClient';

const parseLabels = (content: string): string[] => {
    const matches = content.match(/#(\w+)/g) || [];
    // Remove '#' and get unique labels, converting to lowercase for consistency
    return [...new Set(matches.map(tag => tag.substring(1).toLowerCase()))];
}

interface NotesState {
  notes: Note[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: NotesState = {
  notes: [],
  status: 'idle',
  error: null,
};

export const fetchNotes = createAsyncThunk('notes/fetchNotes', async () => {
    const authState = store.getState().auth;
    if (!authState.user) {
        return [] as Note[];
    }
    const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', authState.user.id)
        .order('created_at', { ascending: false });

    if (error) {
        throw new Error(error.message);
    }
    return data as Note[];
});

export const addNewNote = createAsyncThunk(
    'notes/addNewNote',
    async (initialNote: { title: string; content: string }) => {
        const labels = parseLabels(initialNote.content);
        const authState = store.getState().auth;
        const userId = authState.user?.id ?? null;
        if (!userId) {
            throw new Error('Please sign in to create notes');
        }
        const newNote = { ...initialNote, labels, color: 'default', user_id: userId };

        const { data, error } = await supabase
            .from('notes')
            .insert([newNote])
            .select();
        
        if (error) {
            throw new Error(error.message);
        }
        if (!data || data.length === 0) {
            throw new Error('Insert did not return the created note');
        }
        return data[0] as Note;
    }
);

export const updateExistingNote = createAsyncThunk(
    'notes/updateExistingNote',
    async (noteToUpdate: Note) => {
        const labels = parseLabels(noteToUpdate.content);
        // Supabase can handle partial updates, but we'll send the key fields
        // to ensure consistency.
        const updatedNoteData = { 
            title: noteToUpdate.title,
            content: noteToUpdate.content,
            labels,
            color: noteToUpdate.color,
        };

        const { data, error } = await supabase
            .from('notes')
            .update(updatedNoteData)
            .eq('id', noteToUpdate.id)
            .select();

        if (error) {
            throw new Error(error.message);
        }
        if (!data || data.length === 0) {
            throw new Error('Update did not return the updated note');
        }
        return data[0] as Note;
    }
);

export const deleteExistingNote = createAsyncThunk(
    'notes/deleteExistingNote',
    async (noteId: string) => {
        const { error } = await supabase
            .from('notes')
            .delete()
            .eq('id', noteId);

        if (error) {
            throw new Error(error.message);
        }
        return noteId;
    }
);

export const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
        // fetchNotes
        .addCase(fetchNotes.pending, (state) => {
            state.status = 'loading';
        })
        .addCase(fetchNotes.fulfilled, (state, action: PayloadAction<Note[]>) => {
            state.status = 'succeeded';
            state.notes = action.payload;
        })
        .addCase(fetchNotes.rejected, (state, action) => {
            state.status = 'failed';
            if (action.error.message?.includes("Could not find the table")) {
                state.error = "Database setup needed: The 'notes' table is missing.\n\nPlease run the SQL script found in the comments of services/supabaseClient.ts in your Supabase project's SQL Editor to create it.";
            } else {
                state.error = action.error.message || 'Failed to fetch notes';
            }
        })
        // addNewNote
        .addCase(addNewNote.fulfilled, (state, action: PayloadAction<Note>) => {
            state.notes.unshift(action.payload);
        })
        // updateExistingNote
        .addCase(updateExistingNote.fulfilled, (state, action: PayloadAction<Note>) => {
            const index = state.notes.findIndex((note) => note.id === action.payload.id);
            if (index !== -1) {
                state.notes[index] = action.payload;
            }
        })
        // deleteExistingNote
        .addCase(deleteExistingNote.fulfilled, (state, action: PayloadAction<string>) => {
            state.notes = state.notes.filter((note) => note.id !== action.payload);
        });
  },
});

export const selectAllNotes = (state: RootState) => state.notes.notes;

export default notesSlice.reducer;