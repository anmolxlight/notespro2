
import React, { useState, useRef, useEffect } from 'react';
import { useAppDispatch } from '../hooks/redux';
import { addNewNote } from '../features/notes/notesSlice';
import { motion } from 'framer-motion';
import { SparklesIcon, LoaderCircleIcon } from '../icons';
import { geminiService } from '../services/geminiService';

export const NoteCreator: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFocus = () => setIsFocused(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() || title.trim()) {
      try {
        setError(null);
        await dispatch(addNewNote({ title, content })).unwrap();
        setTitle('');
        setContent('');
        setIsFocused(false);
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to save note');
      }
    }
  };
  
  const handleOutsideClick = async (event: MouseEvent) => {
    if (formRef.current && !formRef.current.contains(event.target as Node)) {
      if (content.trim() || title.trim()) {
        try {
          setError(null);
          await dispatch(addNewNote({ title, content })).unwrap();
        } catch (err: any) {
          setError(err?.message || 'Failed to save note');
        }
      }
      setTitle('');
      setContent('');
      setIsFocused(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleGenerateContent = async () => {
    if ((!content.trim() && !title.trim()) || isGenerating) return;
    setIsGenerating(true);
    try {
      const generatedText = await geminiService.generateInitialNoteContent(title, content);
      setContent(generatedText);
    } catch (error) {
      console.error("Error generating note content:", error);
      // Optionally, show an error message to the user
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      document.addEventListener('mousedown', handleOutsideClick);
    } else {
      document.removeEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused, title, content]);
  
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const canGenerate = title.trim() !== '' || content.trim() !== '';

  return (
    <motion.div 
      layout 
      className="max-w-xl mx-auto my-8"
    >
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="w-full bg-white dark:bg-zinc-900 shadow-lg rounded-lg p-4 transition-all duration-300"
      >
        {error && (
          <div className="mb-2 text-sm text-red-600 dark:text-red-400">{error}</div>
        )}
        <motion.input
          animate={{ height: isFocused ? 'auto' : 0, opacity: isFocused ? 1 : 0, marginBottom: isFocused ? '0.5rem' : 0 }}
          transition={{ duration: 0.2 }}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={handleFocus}
          placeholder="Title"
          className="w-full bg-transparent text-lg font-medium focus:outline-none overflow-hidden"
          disabled={isGenerating}
        />
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={handleFocus}
          placeholder="Take a note or type a prompt for AI..."
          className="w-full bg-transparent focus:outline-none resize-none overflow-hidden"
          rows={1}
          disabled={isGenerating}
        />
        <motion.div
          animate={{ height: isFocused ? 'auto' : 0, opacity: isFocused ? 1 : 0 }}
          className="flex justify-between items-center overflow-hidden"
        >
          <button
            type="button"
            onClick={handleGenerateContent}
            disabled={isGenerating || !canGenerate}
            className="p-2 rounded-full hover:bg-yellow-400/20 dark:hover:bg-yellow-500/30 text-yellow-500 disabled:text-zinc-500 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            title={!canGenerate ? "Enter a title or content to generate AI text" : "Generate content with AI"}
          >
            {isGenerating ? <LoaderCircleIcon className="h-5 w-5 animate-spin" /> : <SparklesIcon className="h-5 w-5" />}
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-semibold rounded-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            Close
          </button>
        </motion.div>
      </form>
    </motion.div>
  );
};
