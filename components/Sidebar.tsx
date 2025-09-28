
import React, { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { selectAllNotes } from '../features/notes/notesSlice';
import { setSelectedLabel } from '../features/filter/filterSlice';
import { cn } from '../lib/utils';
import { TagIcon } from '../icons';

export const Sidebar: React.FC = () => {
    const notes = useAppSelector(selectAllNotes);
    const selectedLabel = useAppSelector((state) => state.filter.selectedLabel);
    const dispatch = useAppDispatch();

    const allLabels = useMemo(() => {
        const labelsSet = new Set<string>();
        notes.forEach(note => {
            note.labels.forEach(label => labelsSet.add(label));
        });
        return Array.from(labelsSet).sort();
    }, [notes]);

    const handleLabelClick = (label: string | null) => {
        dispatch(setSelectedLabel(label));
    };

    return (
        <aside className="w-64 h-[calc(100vh-4rem)] sticky top-16 p-4 border-r border-zinc-200 dark:border-zinc-800 hidden lg:block">
            <nav className="flex flex-col gap-1">
                <button
                    onClick={() => handleLabelClick(null)}
                    className={cn(
                        "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                        !selectedLabel
                            ? "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300"
                            : "hover:bg-zinc-200 dark:hover:bg-zinc-800"
                    )}
                >
                    All Notes
                </button>
                {allLabels.map((label) => (
                    <button
                        key={label}
                        onClick={() => handleLabelClick(label)}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                            selectedLabel === label
                                ? "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300"
                                : "hover:bg-zinc-200 dark:hover:bg-zinc-800"
                        )}
                    >
                        <TagIcon className="h-4 w-4" />
                        <span className="truncate capitalize">{label}</span>
                    </button>
                ))}
            </nav>
        </aside>
    );
};
