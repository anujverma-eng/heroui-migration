import { Provider as ReduxProvider } from 'react-redux';
import { HeroUIProvider } from '@heroui/react';
import { store } from '@/store';

interface ProviderProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProviderProps) {
  return (
    <ReduxProvider store={store}>
      <HeroUIProvider>{children}</HeroUIProvider>
    </ReduxProvider>
  );
}
