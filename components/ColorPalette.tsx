
import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { noteColors, NoteColor } from '../lib/colorUtils';

interface ColorPaletteProps {
    currentColor: NoteColor;
    onColorSelect: (color: NoteColor) => void;
    onClose: () => void;
}

const paletteColorClasses: Record<NoteColor, string> = {
    default: 'bg-white border-zinc-300',
    red: 'bg-red-300',
    blue: 'bg-blue-300',
    green: 'bg-green-300',
    yellow: 'bg-yellow-300',
    purple: 'bg-purple-300',
    gray: 'bg-zinc-400',
};

export const ColorPalette: React.FC<ColorPaletteProps> = ({ currentColor, onColorSelect, onClose }) => {
    const paletteRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (paletteRef.current && !paletteRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    return (
        <motion.div
            ref={paletteRef}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="absolute bottom-full mb-2 right-0 bg-white dark:bg-zinc-800 shadow-lg rounded-lg p-2 flex gap-2 border border-zinc-200 dark:border-zinc-700 z-20"
            onClick={(e) => e.stopPropagation()}
        >
            {Object.keys(noteColors).map((color) => (
                <button
                    key={color}
                    onClick={() => {
                        onColorSelect(color as NoteColor);
                        onClose();
                    }}
                    className={`h-6 w-6 rounded-full flex items-center justify-center border-2 transition-all ${paletteColorClasses[color as NoteColor]} ${
                        currentColor === color ? 'ring-2 ring-yellow-500 ring-offset-2 ring-offset-white dark:ring-offset-zinc-800' : 'border-transparent hover:scale-110'
                    }`}
                    aria-label={`Set color to ${color}`}
                />
            ))}
        </motion.div>
    );
};