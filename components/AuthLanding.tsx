import React from 'react';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { selectAuthStatus, signInWithGoogle, signInWithGithub } from '../features/auth/authSlice';
import { SparklesIcon } from '../icons';

export const AuthLanding: React.FC = () => {
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector(selectAuthStatus);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-zinc-50 via-zinc-100 to-zinc-200 dark:from-zinc-900 dark:via-zinc-950 dark:to-black">
      {/* Hazy background blobs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-yellow-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-purple-300/30 blur-3xl" />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl shadow-xl p-8"
        >
          <div className="flex items-center gap-2 mb-6">
            <SparklesIcon className="h-7 w-7 text-yellow-500" />
            <h1 className="text-2xl font-semibold">Welcome to NotesPro</h1>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-8">
            Sign in to create, organize, and search your notes securely.
          </p>

          <div className="grid gap-3">
            <button
              onClick={() => dispatch(signInWithGoogle())}
              disabled={authStatus === 'loading'}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <img alt="Google" src="https://www.google.com/favicon.ico" className="h-5 w-5" />
              {authStatus === 'loading' ? 'Signing in...' : 'Continue with Google'}
            </button>
            <button
              onClick={() => dispatch(signInWithGithub())}
              disabled={authStatus === 'loading'}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" className="fill-current"><path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.61-4.04-1.61-.55-1.4-1.34-1.77-1.34-1.77-1.09-.75.08-.74.08-.74 1.2.08 1.84 1.23 1.84 1.23 1.07 1.83 2.81 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.66-.3-5.47-1.34-5.47-5.98 0-1.32.47-2.4 1.24-3.25-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.24a11.5 11.5 0 0 1 6 0c2.3-1.56 3.3-1.24 3.3-1.24.66 1.66.24 2.88.12 3.18.77.85 1.24 1.93 1.24 3.25 0 4.65-2.81 5.68-5.49 5.98.43.38.81 1.11.81 2.24v3.32c0 .32.22.69.82.58A12 12 0 0 0 12 .5Z"/></svg>
              {authStatus === 'loading' ? 'Signing in...' : 'Continue with GitHub'}
            </button>
          </div>

          <p className="mt-6 text-xs text-zinc-500 text-center">
            By continuing, you agree to our Terms and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLanding;

