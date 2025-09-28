import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../store/store';
import { supabase } from '../../services/supabaseClient';

export interface AuthUser {
  id: string;
  email: string | null;
  avatar_url?: string | null;
  full_name?: string | null;
}

interface AuthState {
  user: AuthUser | null;
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error';
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
  error: null,
};

export const signInWithGoogle = createAsyncThunk('auth/signInWithGoogle', async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      queryParams: {
        prompt: 'consent',
      },
    },
  });
  if (error) {
    throw new Error(error.message);
  }
  return data.url || null;
});

export const signOut = createAsyncThunk('auth/signOut', async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
});

export const getSession = createAsyncThunk('auth/getSession', async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new Error(error.message);
  }
  return data.session ?? null;
});

const mapUser = (session: any): AuthUser | null => {
  if (!session?.user) return null;
  const u = session.user;
  return {
    id: u.id,
    email: u.email ?? null,
    avatar_url: u.user_metadata?.avatar_url ?? null,
    full_name: u.user_metadata?.full_name ?? null,
  };
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUserFromSession(state, action: PayloadAction<any | null>) {
      const mapped = mapUser(action.payload);
      state.user = mapped;
      state.status = mapped ? 'authenticated' : 'unauthenticated';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signInWithGoogle.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(signInWithGoogle.fulfilled, (state, action) => {
        // For OAuth, Supabase will redirect; state will be updated via listener after redirect
        state.status = 'idle';
      })
      .addCase(signInWithGoogle.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message || 'Failed to sign in';
      })
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
        state.status = 'unauthenticated';
        state.error = null;
      })
      .addCase(getSession.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getSession.fulfilled, (state, action) => {
        const mapped = mapUser(action.payload);
        state.user = mapped;
        state.status = mapped ? 'authenticated' : 'unauthenticated';
      })
      .addCase(getSession.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message || 'Failed to get session';
      });
  },
});

export const { setUserFromSession } = authSlice.actions;

export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectAuthStatus = (state: RootState) => state.auth.status;

export default authSlice.reducer;

