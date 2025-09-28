
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircleIcon, XIcon, SendIcon, SparklesIcon, LoaderCircleIcon } from '../icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '../hooks/redux';
import { selectAllNotes } from '../features/notes/notesSlice';
import { geminiService } from '../services/geminiService';

interface Message {
    sender: 'user' | 'bot';
    text: string;
}

export const RagChat: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const allNotes = useAppSelector(selectAllNotes);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;

        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const botResponse = await geminiService.answerQuestionFromNotes(input, allNotes);
            const botMessage: Message = { sender: 'bot', text: botResponse };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('RAG chat error:', error);
            const errorMessage: Message = { sender: 'bot', text: "Sorry, something went wrong." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 bg-yellow-500 text-white p-4 rounded-full shadow-lg z-50"
                aria-label="Toggle AI Chat"
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={isOpen ? 'close' : 'open'}
                        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                        exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.2 }}
                    >
                        {isOpen ? <XIcon className="h-6 w-6" /> : <MessageCircleIcon className="h-6 w-6" />}
                    </motion.div>
                </AnimatePresence>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed bottom-24 right-6 w-full max-w-sm h-[60vh] bg-white dark:bg-zinc-900 rounded-xl shadow-2xl flex flex-col z-40 overflow-hidden"
                    >
                        <header className="p-4 border-b dark:border-zinc-700 flex items-center gap-2">
                           <SparklesIcon className="h-5 w-5 text-yellow-500" />
                           <h3 className="font-semibold">Ask About Your Notes</h3>
                        </header>
                        
                        <div className="flex-1 p-4 overflow-y-auto">
                            {messages.length === 0 && (
                                <div className="text-center text-sm text-zinc-500 h-full flex items-center justify-center">
                                    <p>Ask me anything about the content of your notes.</p>
                                </div>
                            )}
                            {messages.map((msg, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-2 my-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}
                                >
                                    <div className={`max-w-xs md:max-w-md rounded-2xl px-4 py-2 ${msg.sender === 'user' ? 'bg-yellow-500 text-white rounded-br-none' : 'bg-zinc-200 dark:bg-zinc-700 rounded-bl-none'}`}>
                                        <p className="text-sm">{msg.text}</p>
                                    </div>
                                </motion.div>
                            ))}
                             {isLoading && (
                                <div className="flex gap-2 my-2">
                                     <div className="max-w-xs md:max-w-md rounded-2xl px-4 py-2 bg-zinc-200 dark:bg-zinc-700 rounded-bl-none flex items-center">
                                        <LoaderCircleIcon className="h-5 w-5 animate-spin text-zinc-500"/>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        
                        <div className="p-4 border-t dark:border-zinc-700">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Type your question..."
                                    className="w-full bg-zinc-100 dark:bg-zinc-700 rounded-full py-2 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                />
                                <button onClick={handleSend} disabled={isLoading} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-yellow-500 text-white hover:bg-yellow-600 disabled:bg-zinc-600 transition-colors">
                                    <SendIcon className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
