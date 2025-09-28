
export const noteColors = {
  default: {
    bg: 'bg-white dark:bg-zinc-900',
    border: 'border-zinc-200 dark:border-zinc-800',
  },
  red: {
    bg: 'bg-red-100 dark:bg-red-950/60',
    border: 'border-red-200 dark:border-red-800/80',
  },
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-950/60',
    border: 'border-blue-200 dark:border-blue-800/80',
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-950/60',
    border: 'border-green-200 dark:border-green-800/80',
  },
  yellow: {
    bg: 'bg-yellow-100 dark:bg-yellow-950/60',
    border: 'border-yellow-200 dark:border-yellow-800/80',
  },
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-950/60',
    border: 'border-purple-200 dark:border-purple-800/80',
  },
  gray: {
    bg: 'bg-zinc-200 dark:bg-zinc-800',
    border: 'border-zinc-300 dark:border-zinc-700',
  },
};

export type NoteColor = keyof typeof noteColors;

export const getNoteColorClasses = (color: NoteColor | string | undefined | null) => {
  const noteColor = color as NoteColor;
  if (color && noteColors[noteColor]) {
    return noteColors[noteColor];
  }
  return noteColors.default;
};