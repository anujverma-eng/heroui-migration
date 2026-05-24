// This guard sits inside the dashboard and checks if the user
// has the permission required to view a specific page.
// It renders an "Access Denied" page instead of redirecting,
// because the user IS authenticated — they just lack access to this resource.

import { Outlet, useLocation } from 'react-router-dom';
import { ROUTE_PERMISSIONS } from '@/constants';

// We'll build usePermissions properly in Phase 5.
// For now, a placeholder that always grants access.
// This lets us build the full routing structure without
// blocking on the permissions system.
function useHasPermission(_permission: string): boolean {
  return true; // temporary — replaced in Phase 5
}

interface PermissionRouteProps {
  // Explicit permission override — if provided, checks this instead of the route map
  permission?: string;
  children?: React.ReactNode;
}

export function PermissionRoute({ permission }: PermissionRouteProps) {
  const location = useLocation();

  // Look up required permissions for this route
  const requiredPermissions = permission
    ? [permission]
    : (ROUTE_PERMISSIONS[location.pathname] ?? []);

  // If no permissions required, always allow
  if (requiredPermissions.length === 0) {
    return <Outlet />;
  }

  // Check if user has ALL required permissions
  const hasAccess = requiredPermissions.every(
    (perm) => useHasPermission(perm), // eslint-disable-line react-hooks/rules-of-hooks
  );

  if (!hasAccess) {
    return <AccessDeniedPage />;
  }

  return <Outlet />;
}

// Inline — this is simple enough not to need its own file yet
function AccessDeniedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="text-6xl">🔒</div>
        <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="text-default-500 text-sm">
          You don't have permission to view this page. Contact your
          administrator to request access.
        </p>
        <a
          href="/dashboard/home"
          className="inline-block px-4 py-2 bg-brand-600 text-white 
                     rounded-lg hover:bg-brand-700 transition-colors text-sm"
        >
          Back to Dashboard
        </a>
      </div>
    </div>
  );
}
