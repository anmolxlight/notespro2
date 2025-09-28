
import { configureStore } from '@reduxjs/toolkit';
import notesReducer from '../features/notes/notesSlice';
import themeReducer from '../features/theme/themeSlice';
import filterReducer from '../features/filter/filterSlice';
import modalReducer from '../features/modal/modalSlice';
import authReducer, { setUserFromSession } from '../features/auth/authSlice';
import { supabase } from '../services/supabaseClient';

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
supabase.auth.getSession().then(({ data }) => {
  store.dispatch(setUserFromSession(data.session ?? null));
});

supabase.auth.onAuthStateChange((_event, session) => {
  store.dispatch(setUserFromSession(session ?? null));
});
