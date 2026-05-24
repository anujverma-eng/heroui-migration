import { AppDispatch, RootState } from '@/store';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// useAppDispatch: dispatch function that understand thunks
export const useAppDispatch = () => useDispatch<AppDispatch>();

// useAppSelector: selector that knows RootState's shape
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
