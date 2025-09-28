
import { configureStore } from '@reduxjs/toolkit';
import notesReducer from '../features/notes/notesSlice';
import themeReducer from '../features/theme/themeSlice';
import filterReducer from '../features/filter/filterSlice';
import modalReducer from '../features/modal/modalSlice';
import authReducer, { setUserFromSession } from '../features/auth/authSlice';
import { supabase } from '../services/supabaseClient';
import { fetchNotes } from '../features/notes/notesSlice';

export const store = configureStore({
  reducer: {
    notes: notesReducer,
    theme: themeReducer,
    filter: filterReducer,
    modal: modalReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Keep Redux auth state in sync with Supabase session
const bootstrapAuthFromUrl = async () => {
  if (typeof window === 'undefined') return;
  try {
    if (window.location.hash && window.location.hash.includes('access_token')) {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      if (access_token && refresh_token) {
        await supabase.auth.setSession({ access_token, refresh_token });
        window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
      }
    }
  } catch {
    // ignore and proceed
  } finally {
    const { data } = await supabase.auth.getSession();
    store.dispatch(setUserFromSession(data.session ?? null));
    if (data.session?.user) {
      store.dispatch(fetchNotes());
    }
  }
};

void bootstrapAuthFromUrl();

supabase.auth.onAuthStateChange((_event, session) => {
  store.dispatch(setUserFromSession(session ?? null));
  if (session?.user) {
    store.dispatch(fetchNotes());
  }
});
