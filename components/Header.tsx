
import React from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { toggleTheme } from '../features/theme/themeSlice';
import { SunIcon, MoonIcon, SparklesIcon, SearchIcon } from '../icons';
import { motion, AnimatePresence } from 'framer-motion';
import { setSearchQuery } from '../features/filter/filterSlice';

const SearchBar: React.FC = () => {
    const dispatch = useAppDispatch();
    const searchQuery = useAppSelector((state) => state.filter.searchQuery);

    return (
        <div className="relative w-full max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
            <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                className="w-full pl-10 pr-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
            />
        </div>
    );
};


export const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.mode);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm">
      <div className="container mx-auto h-16 flex items-center justify-between px-4 gap-4">
        <div className="flex items-center gap-2 flex-shrink-0">
          <SparklesIcon className="h-6 w-6 text-yellow-500" />
          <h1 className="text-xl font-bold hidden sm:block">NotesPro</h1>
        </div>
        <div className="flex-1 flex justify-center px-4">
          <SearchBar />
        </div>
        <motion.button
          onClick={() => dispatch(toggleTheme())}
          className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          whileTap={{ scale: 0.9, rotate: 30 }}
        >
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={theme}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </motion.div>
          </AnimatePresence>
        </motion.button>
      </div>
    </header>
  );
};
