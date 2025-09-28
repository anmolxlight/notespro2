
import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { closeNoteModal } from '../features/modal/modalSlice';
import { updateExistingNote } from '../features/notes/notesSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { geminiService } from '../services/geminiService';
import { SparklesIcon, LoaderCircleIcon, SendIcon, Wand2Icon, PilcrowIcon, PaletteIcon } from '../icons';
import { cn } from '../lib/utils';
import { getNoteColorClasses, NoteColor } from '../lib/colorUtils';
import { ColorPalette } from './ColorPalette';

export const NoteModal: React.FC = () => {
    const dispatch = useAppDispatch();
    const { selectedNoteId } = useAppSelector((state) => state.modal);
    const note = useAppSelector((state) =>
        state.notes.notes.find((n) => n.id === selectedNoteId)
    );

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [color, setColor] = useState('default');
    const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
    const [isColorPaletteOpen, setIsColorPaletteOpen] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationTarget, setGenerationTarget] = useState<'custom' | 'summarize' | 'improve' | null>(null);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const initialNoteState = useRef<{title: string, content: string, color: string} | null>(null);

    const colorClasses = getNoteColorClasses(color);

    useEffect(() => {
        if (note) {
            setTitle(note.title);
            setContent(note.content);
            setColor(note.color);
            initialNoteState.current = { title: note.title, content: note.content, color: note.color };
        } else {
            // Reset panels when modal is closed
            setIsAiPanelOpen(false);
            setIsColorPaletteOpen(false);
            setAiPrompt('');
        }
    }, [note]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [content]);
    
    const handleSaveChanges = () => {
        if (note && initialNoteState.current && (title !== initialNoteState.current.title || content !== initialNoteState.current.content)) {
            dispatch(updateExistingNote({ ...note, title, content, color }));
        }
    }

    const handleClose = () => {
        handleSaveChanges();
        dispatch(closeNoteModal());
    };
    
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleClose();
            }
        };

        if (selectedNoteId) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'auto';
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedNoteId, title, content, color]);


    const handleAiAction = async (action: 'summarize' | 'improve' | 'custom', customPrompt?: string) => {
        if (isGenerating || !note) return;
    
        let prompt = '';
        let isReplacement = false;
        
        switch (action) {
            case 'summarize':
                prompt = 'Summarize the following note.';
                isReplacement = true;
                setGenerationTarget('summarize');
                break;
            case 'improve':
                prompt = 'Improve the writing. Fix grammar and spelling, enhance clarity, and make it more concise without losing the original meaning.';
                isReplacement = true;
                setGenerationTarget('improve');
                break;
            case 'custom':
                if (!customPrompt || !customPrompt.trim()) return;
                prompt = customPrompt;
                isReplacement = false; // append
                setGenerationTarget('custom');
                break;
        }
    
        setIsGenerating(true);
        try {
            let newText = '';
            if (isReplacement) {
                newText = await geminiService.generateReplacementTextForNote(prompt, content);
                setContent(newText);
            } else {
                newText = await geminiService.generateTextForNote(prompt, content);
                setContent(prev => `${prev}\n\n**AI (${prompt}):**\n${newText}`);
            }
        } catch (error) {
            console.error("Error during AI generation:", error);
        } finally {
            setIsGenerating(false);
            setAiPrompt('');
            setGenerationTarget(null);
        }
    }

    const handleColorChange = (newColor: NoteColor) => {
        if (!note) return;
        setColor(newColor);
        // Dispatch update immediately for real-time feel
        dispatch(updateExistingNote({ ...note, title, content, color: newColor }));
        // Update the initial state ref so we don't re-save on close unless other changes are made
        if (initialNoteState.current) {
            initialNoteState.current.color = newColor;
        }
    };

    if (!selectedNoteId || !note) {
        return null;
    }
    
    return (
        <AnimatePresence>
            {selectedNoteId && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 50, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 50, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className={cn("rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col border", colorClasses.bg, colorClasses.border)}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 flex-grow overflow-y-auto">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Title"
                                className="w-full bg-transparent text-xl font-bold focus:outline-none mb-4"
                                disabled={isGenerating}
                            />
                            <textarea
                                ref={textareaRef}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Take a note..."
                                className="w-full bg-transparent focus:outline-none resize-none overflow-hidden text-sm"
                                rows={1}
                                disabled={isGenerating}
                            />
                        </div>

                        <AnimatePresence>
                            {isAiPanelOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden border-t border-black/10 dark:border-white/10"
                                >
                                    <div className="p-4 flex flex-col gap-3">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <button 
                                                onClick={() => handleAiAction('summarize')}
                                                disabled={isGenerating}
                                                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                                {isGenerating && generationTarget === 'summarize' ? <LoaderCircleIcon className="h-4 w-4 animate-spin" /> : <PilcrowIcon className="h-4 w-4" />}
                                                Summarize
                                            </button>
                                            <button 
                                                onClick={() => handleAiAction('improve')}
                                                disabled={isGenerating}
                                                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                                {isGenerating && generationTarget === 'improve' ? <LoaderCircleIcon className="h-4 w-4 animate-spin" /> : <Wand2Icon className="h-4 w-4" />}
                                                Improve Writing
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={aiPrompt}
                                                onChange={(e) => setAiPrompt(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleAiAction('custom', aiPrompt);
                                                }}
                                                placeholder="Or type a prompt to add content..."
                                                className="w-full bg-black/5 dark:bg-white/10 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                                disabled={isGenerating}
                                            />
                                            <button
                                                onClick={() => handleAiAction('custom', aiPrompt)}
                                                disabled={isGenerating || !aiPrompt.trim()}
                                                className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-yellow-500 text-white disabled:bg-zinc-600 transition-colors"
                                            >
                                                {isGenerating && generationTarget === 'custom' ? <LoaderCircleIcon className="h-4 w-4 animate-spin" /> : <SendIcon className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                         <div className="flex items-center justify-between p-4 border-t border-black/10 dark:border-white/10">
                             <div className="flex items-center gap-2">
                                <button
                                    onClick={() => { setIsAiPanelOpen(!isAiPanelOpen); setIsColorPaletteOpen(false); }}
                                    className="p-2 rounded-full hover:bg-yellow-400/20 dark:hover:bg-yellow-500/30 text-yellow-500"
                                    title="AI Actions"
                                >
                                    <SparklesIcon className="h-5 w-5" />
                                </button>
                                <div className="relative">
                                    <button
                                        onClick={() => { setIsColorPaletteOpen(!isColorPaletteOpen); setIsAiPanelOpen(false); }}
                                        className="p-2 rounded-full hover:bg-zinc-400/20 dark:hover:bg-zinc-500/30 text-zinc-500"
                                        title="Change color"
                                    >
                                        <PaletteIcon className="h-5 w-5" />
                                    </button>
                                    <AnimatePresence>
                                        {isColorPaletteOpen && (
                                            <ColorPalette
                                                currentColor={color as NoteColor}
                                                onColorSelect={handleColorChange}
                                                onClose={() => setIsColorPaletteOpen(false)}
                                            />
                                        )}
                                    </AnimatePresence>
                                </div>
                                <div className="text-xs text-zinc-500">
                                 Created: {new Date(note.created_at).toLocaleDateString()}
                                </div>
                             </div>
                             <button
                                 onClick={handleClose}
                                 className="px-4 py-2 text-sm font-semibold rounded-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                             >
                                 Done
                             </button>
                         </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};