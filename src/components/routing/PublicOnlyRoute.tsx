import { Navigate, Outlet, useLocation } from 'react-router-dom';
import {
  selectAuthStatus,
  selectPendingConfirmation,
} from '@/features/auth/authSlice';
import { useAppSelector } from '@/hooks/store';
import { ROUTES } from '@/constants';

export function PublicOnlyRoute() {
  const status = useAppSelector(selectAuthStatus);
  const pendingConfirmation = useAppSelector(selectPendingConfirmation);
  const location = useLocation();

  // while we're checking if a session exists, render nothing.
  // This prevents the flash of the login page for authenticated users.
  if (status === 'idle' || status === 'loading') {
    return null;
  }

  // Special case: user registered but hasn't confirmed OTP yet.
  // They're technically unauthenticated but shouldn't see the login page
  // they should be on the confirm-otp page. Allow them through.
  if (pendingConfirmation && location.pathname !== ROUTES.CONFIRM_OTP) {
    return <Navigate to={ROUTES.CONFIRM_OTP} replace />;
  }

  // If authenticated, send them to dashboard.
  if (status === 'authenticated') {
    return <Navigate to={ROUTES.DASHBOARD.HOME} replace />;
  }

  // Not authenticated - render the public page.
  // <Outlet/> renders whatever child route matched.
  return <Outlet />;
}
