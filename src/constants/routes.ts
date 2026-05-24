export const ROUTES = {
  // Public Routes
  HOME: '/',
  LOGIN: '/login',

  // Invite (public but token-gated)
  INVITE: '/invites/:token',
  INVITE_ACCEPT: (token: string) => `/invites/${token}/accept`,

  // Onboarding (private but pre-dashboard)
  ONBOARDING: '/onboarding',
  INVITATIONS: '/invitations',

  // Dashboard (private, permission-gated)
  DASHBOARD: {
    ROOT: '/dashboard',
    HOME: '/dashboard/home',
    PROFILE: '/dashboard/profile',
    SETTINGS: '/dashboard/settings',
    TEAM: '/dashboard/team',
    NOTIFICATIONS: '/dashboard/notifications',
    ACTIVITY: '/dashboard/activity',
  },

  // Fallback
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '/404',
} as const;
