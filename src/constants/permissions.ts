import { ROUTES } from './routes';

export const PERMISSIONS = {
  ORG: {
    VIEW: 'org.view',
    UPDATE: 'org.update',
    DELETE: 'org.delete',
  },
  MEMBER: {
    VIEW_LIST: 'member.view_list',
    INVITE: 'member.invite',
    REMOVE: 'member.remove',
    UPDATE_ROLE: 'member.update_role',
  },
  DEVICE: {
    VIEW_LIST: 'device.view_list',
    REGISTER: 'device.register', // default: ALL members can do this
    UPDATE: 'device.update',
    DELETE: 'device.delete',
    SHARE: 'device.share', // future
  },
  FOLDER: {
    VIEW: 'folder.view',
    CREATE: 'folder.create',
    UPDATE: 'folder.update',
    DELETE: 'folder.delete',
  },
  FILE: {
    VIEW: 'file.view',
    DOWNLOAD: 'file.download',
    DELETE: 'file.delete',
  },
  TRASH: {
    VIEW: 'trash.view',
    RESTORE: 'trash.restore',
    PURGE: 'trash.purge',
  },
  ATTACHMENT: {
    VIEW: 'attachment.view',
    UPLOAD: 'attachment.upload',
    DELETE: 'attachment.delete',
  },
  SETTINGS: {
    VIEW: 'settings.view',
    UPDATE: 'settings.update',
  },
} as const;

export const ROUTE_PERMISSIONS: Record<string, string[]> = {
  [ROUTES.DASHBOARD.TEAM]: [PERMISSIONS.MEMBER.VIEW_LIST],
  [ROUTES.DASHBOARD.SETTINGS]: [PERMISSIONS.SETTINGS.VIEW],
  // [ROUTES.DASHBOARD.NOTIFICATIONS]
};
