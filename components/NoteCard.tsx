
import React, { useState } from 'react';
import type { Note } from '../types';
import { useAppDispatch } from '../hooks/redux';
import { deleteExistingNote, updateExistingNote } from '../features/notes/notesSlice';
import { Trash2Icon, SparklesIcon, LoaderCircleIcon, SendIcon, PaletteIcon } from '../icons';
import { geminiService } from '../services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';
import { setSelectedLabel } from '../features/filter/filterSlice';
import { openNoteModal } from '../features/modal/modalSlice';
import { getNoteColorClasses, NoteColor } from '../lib/colorUtils';
import { ColorPalette } from './ColorPalette';
import { cn } from '../lib/utils';

interface NoteCardProps {
  note: Note;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note }) => {
  const dispatch = useAppDispatch();
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [isColorPaletteOpen, setIsColorPaletteOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const colorClasses = getNoteColorClasses(note.color);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(deleteExistingNote(note.id));
  };

  const handleOpenAiPanel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsColorPaletteOpen(false);
    setIsAiPanelOpen(!isAiPanelOpen);
  };
  
  const handleToggleColorPalette = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAiPanelOpen(false);
    setIsColorPaletteOpen(prev => !prev);
  }
  
  const handleColorChange = (color: NoteColor) => {
    dispatch(updateExistingNote({ ...note, color }));
  };

  const handleGenerateText = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const generatedText = await geminiService.generateTextForNote(aiPrompt, note.content);
      const newContent = `${note.content}\n\n**AI (${aiPrompt}):**\n${generatedText}`;
      dispatch(updateExistingNote({ ...note, content: newContent }));
      setIsAiPanelOpen(false);
      setAiPrompt('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleGenerateTextClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleGenerateText();
  };

  const handleLabelClick = (e: React.MouseEvent, label: string) => {
    e.stopPropagation();
    dispatch(setSelectedLabel(label));
  };

  const handleCardClick = () => {
    dispatch(openNoteModal(note.id));
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn("group relative rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-4 flex flex-col cursor-pointer border",
        colorClasses.bg,
        colorClasses.border
      )}
    >
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={handleOpenAiPanel}
          className="p-2 rounded-full hover:bg-yellow-400/20 dark:hover:bg-yellow-500/30 text-yellow-500"
          title="AI Generate"
        >
          <SparklesIcon className="h-5 w-5" />
        </button>
      </div>
      
      <div className="flex-grow pr-8">
        {note.title && <h3 className="font-bold mb-2">{note.title}</h3>}
        <p className="text-sm whitespace-pre-wrap">{note.content}</p>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex flex-wrap gap-1">
          {note.labels.map(label => (
            <button key={label} onClick={(e) => handleLabelClick(e, label)} className="px-2 py-0.5 bg-black/5 dark:bg-white/10 text-xs rounded-full hover:bg-yellow-400 dark:hover:bg-yellow-600 transition-colors">
              #{label}
            </button>
          ))}
        </div>

        <div className="-mb-2 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center">
            <div className="relative">
                <button
                    onClick={handleToggleColorPalette}
                    className="p-2 rounded-full hover:bg-zinc-400/20 dark:hover:bg-zinc-500/30 text-zinc-500"
                    title="Change color"
                >
                    <PaletteIcon className="h-5 w-5" />
                </button>
                <AnimatePresence>
                {isColorPaletteOpen && (
                    <ColorPalette
                        currentColor={note.color as NoteColor}
                        onColorSelect={handleColorChange}
                        onClose={() => setIsColorPaletteOpen(false)}
                    />
                )}
                </AnimatePresence>
            </div>
            <button
            onClick={handleDelete}
            className="p-2 rounded-full hover:bg-red-400/20 dark:hover:bg-red-500/30 text-red-500"
            title="Delete Note"
            >
            <Trash2Icon className="h-5 w-5" />
            </button>
        </div>
      </div>
      
      <AnimatePresence>
        {isAiPanelOpen && (
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-2"
          >
            <div className="relative">
               <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.stopPropagation();
                    handleGenerateText();
                  }
                }}
                placeholder="e.g., 'summarize this'"
                className="w-full bg-black/5 dark:bg-white/10 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                disabled={isGenerating}
              />
               <button
                onClick={handleGenerateTextClick}
                disabled={isGenerating}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-yellow-500 text-white disabled:bg-zinc-600"
              >
                {isGenerating ? (
                  <LoaderCircleIcon className="h-4 w-4 animate-spin" />
                ) : (
                  <SendIcon className="h-4 w-4" />
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};