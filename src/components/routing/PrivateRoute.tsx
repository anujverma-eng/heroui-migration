import {
  selectAuthStatus,
  selectPendingConfirmation,
} from '@/features/auth/authSlice';
import { useAppSelector } from '@/hooks/store';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { FullScreenLoader } from '../loaders/FullScreenLoader';
import { ROUTES } from '@/constants';

export function PrivateRoute() {
  const status = useAppSelector(selectAuthStatus);
  const pendingConfirmation = useAppSelector(selectPendingConfirmation);
  const location = useLocation();

  // Still checking the session - render a full-screen loader.
  // We do Not return null here because unlike PublicOnlyRoute,
  // a private page should show a loading state, not a blank screen.

  if (status === 'idle' || status === 'loading') {
    return <FullScreenLoader show={true} />;
  }

  // If user needs OTP confirmation, send them there.
  // This prevents a user who registered but didn't confirm
  // from accessing the dashboard.
  if (pendingConfirmation) {
    return <Navigate to={ROUTES.CONFIRM_OTP} replace />;
  }

  // Not authenticated - redirect to login.
  // we pass the current location in state so the login page can redirect back here after successful login.
  if (status === 'unauthenticated' || status === 'error') {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // If authenticated, render the protected page.
  // <Outlet/> renders whatever child route matched.
  return <Outlet />;
}
