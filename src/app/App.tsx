import { AuthBootstrap } from '@/features/auth/components/AuthBootstrap';
import { RouterProvider } from 'react-router-dom';
import { Providers } from './providers';
import { router } from './router';



export function App() {
  return (
    <Providers>
      <AuthBootstrap />
      <RouterProvider router={router} />
      {/* <MotionicsCloudAccessLanding /> */}
    </Providers>
  );
}
