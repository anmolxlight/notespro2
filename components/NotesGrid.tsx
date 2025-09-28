
import React, { useMemo } from 'react';
import { useAppSelector } from '../hooks/redux';
import { selectAllNotes } from '../features/notes/notesSlice';
import { NoteCard } from './NoteCard';
import { motion, AnimatePresence } from 'framer-motion';
import { LoaderCircleIcon } from '../icons';

export const NotesGrid: React.FC = () => {
  const notes = useAppSelector(selectAllNotes);
  const notesStatus = useAppSelector((state) => state.notes.status);
  const error = useAppSelector((state) => state.notes.error);
  const { searchQuery, selectedLabel } = useAppSelector((state) => state.filter);

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesLabel = selectedLabel ? note.labels.includes(selectedLabel) : true;
      const lowercasedQuery = searchQuery.toLowerCase();
      const matchesSearch = searchQuery ?
        note.title.toLowerCase().includes(lowercasedQuery) ||
        note.content.toLowerCase().includes(lowercasedQuery)
        : true;
      return matchesLabel && matchesSearch;
    });
  }, [notes, searchQuery, selectedLabel]);

  if (notesStatus === 'loading') {
    return (
        <div className="flex justify-center items-center mt-16">
            <LoaderCircleIcon className="h-10 w-10 animate-spin text-yellow-500" />
        </div>
    );
  }

  if (notesStatus === 'failed') {
    return (
        <div className="max-w-2xl mx-auto mt-16 p-6 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 rounded-lg text-center">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Database Connection Error</h3>
            <p className="mt-2 text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap">{error}</p>
        </div>
    );
  }

  if (notesStatus === 'succeeded' && filteredNotes.length === 0) {
    const message = (searchQuery || selectedLabel) ? "No matching notes found." : "No notes yet. Create one to get started!";
    return (
        <div className="text-center text-zinc-500 mt-16">
            <p>{message}</p>
        </div>
    );
  }

  return (
    <div className="columns-1 sm:columns-2 md:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 gap-4 space-y-4">
        <AnimatePresence>
            {filteredNotes.map((note) => (
            <motion.div
                key={note.id}
                layout
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="break-inside-avoid"
            >
                <NoteCard note={note} />
            </motion.div>
            ))}
        </AnimatePresence>
    </div>
  );
};
