
import React, { useEffect } from 'react';
import { Header } from './components/Header';
import { NoteCreator } from './components/NoteCreator';
import { NotesGrid } from './components/NotesGrid';
import { RagChat } from './components/RagChat';
import { Sidebar } from './components/Sidebar';
import { useAppDispatch, useAppSelector } from './hooks/redux';
import { NoteModal } from './components/NoteModal';
import { fetchNotes } from './features/notes/notesSlice';
import { selectAuthUser } from './features/auth/authSlice';
import AuthLanding from './components/AuthLanding';

function App() {
  const theme = useAppSelector((state) => state.theme.mode);
  const dispatch = useAppDispatch();
  const notesStatus = useAppSelector((state) => state.notes.status);
  const user = useAppSelector(selectAuthUser);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'dark' ? 'light' : 'dark');
    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    if (user) {
      dispatch(fetchNotes());
    }
  }, [user?.id, dispatch]);

  if (!user) {
    return <AuthLanding />;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans transition-colors duration-300">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <NoteCreator />
          <NotesGrid />
        </main>
      </div>
      <RagChat />
      <NoteModal />
    </div>
  );
}

export default App;