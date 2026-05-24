// This component renders NOTHING visible.
// Its only job is to run initializeAuth() when the app first loads,
// which transitions auth status from 'idle' to either
// 'authenticated' or 'unauthenticated'.
//
// Without this, the app would stay in 'idle' status forever
// and route guards would show a spinner indefinitely.

import { useAppDispatch } from '@/hooks/store';
import { useEffect } from 'react';
import { initializeAuth } from '../authSlice';

export function AuthBootstrap() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // dispatch returns a promise for thunks.
    // we don't await it here - the slice handles state updates automatically.
    dispatch(initializeAuth());
  }, []);

  return null;
}
