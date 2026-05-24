import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import confirmationReducer from '@/features/auth/confirmationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    confirmation: confirmationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/setSession'],
        ignoredPaths: [],
      },
    }),
  devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
