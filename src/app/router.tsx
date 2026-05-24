// This is the single file that defines the entire navigation structure
// of the application. Every URL that exists in the app is defined here.
//
// Reading guide:
// - createBrowserRouter: creates an HTML5 history router (uses the URL bar)
// - element: the component rendered when this route matches
// - children: nested routes that render inside the parent's <Outlet />
// - index: marks the default child route (renders when no child path matches)

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PublicLayout } from '@/components/layout/PublicLayout';
import {
  PermissionRoute,
  PrivateRoute,
  PublicOnlyRoute,
} from '@/components/routing';
import { PERMISSIONS, ROUTES } from '@/constants';
import { LoginRegisterPage } from '@/features/auth/pages/LoginRegisterPage';
import { DashboardHomePage } from '@/features/dashboard/pages/DashboardHomePage';
import { ProfilePage } from '@/features/dashboard/pages/ProfilePage';
import { SettingsPage } from '@/features/dashboard/pages/SettingsPage';
import { TeamPage } from '@/features/dashboard/pages/TeamPage';
import { OnboardingPage } from '@/features/onboarding/pages/OnboardingPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { UnauthorizedPage } from '@/pages/UnauthorizedPage';
import { createBrowserRouter, Navigate } from 'react-router-dom';

export const router = createBrowserRouter([
  // -------Public Routes-------
  // PublicOnlyRoute: if already logged in, redirect to dashboard.
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          // Root redirects to login
          {
            path: ROUTES.HOME,
            element: <Navigate to={ROUTES.LOGIN} replace />,
          },
          {
            path: ROUTES.LOGIN,
            element: <LoginRegisterPage />,
          },
        ],
      },
    ],
  },

  // ----- Private Routes -----
  // PrivateRoute: if not logged in, redirect to login.
  {
    element: <PrivateRoute />,
    children: [
      // Onboarding - logged in but before full dashboard access
      {
        path: ROUTES.ONBOARDING,
        element: <OnboardingPage />,
      },
      // Dashboard - full app with sidebar/topbar layout
      {
        path: ROUTES.DASHBOARD.ROOT,
        element: <DashboardLayout />,
        children: [
          // /dashboard -> redirect to /dashboard/home
          {
            index: true,
            element: <Navigate to={ROUTES.DASHBOARD.HOME} replace />,
          },
          // Home - no special permission needed beyond being logged in
          {
            path: ROUTES.DASHBOARD.HOME,
            element: <DashboardHomePage />,
          },
          // Profile - no special permission needed beyond being logged in
          {
            path: ROUTES.DASHBOARD.PROFILE,
            element: <ProfilePage />,
          },
          // Settings - no special permission needed beyond being logged in
          {
            element: <PermissionRoute permission={PERMISSIONS.SETTINGS.VIEW} />,
            children: [
              {
                path: ROUTES.DASHBOARD.SETTINGS,
                element: <SettingsPage />,
              },
            ],
          },
          // Team - requires VIEW_LIST permission
          {
            element: (
              <PermissionRoute permission={PERMISSIONS.MEMBER.VIEW_LIST} />
            ),
            children: [
              {
                path: ROUTES.DASHBOARD.TEAM,
                element: <TeamPage />,
              },
            ],
          },
        ],
      },
    ],
  },

  // ----- Static / Utility Routes -----
  {
    path: ROUTES.UNAUTHORIZED,
    element: <UnauthorizedPage />,
  },
  {
    path: ROUTES.NOT_FOUND,
    element: <NotFoundPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
