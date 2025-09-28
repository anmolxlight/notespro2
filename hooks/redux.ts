import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';

// Fix: Switched to a more common syntax for typing the useDispatch hook.
// This resolves an issue where dispatching async thunks was causing a type error.
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();