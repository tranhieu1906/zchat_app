import JWT, { SupportedAlgorithms } from 'expo-jwt';

const SecretKey = process.env.EXPO_AUTH_SECRET ?? 'bot-genius-access-token';

export enum PermissionsGroup {
  autoAssignmentSetting = 'autoAssignmentSetting',
  chatSetting = 'chatSetting',
  flow = 'flow',
  generalSetting = 'generalSetting',
  integrationsSetting = 'integrationsSetting',
  keyword = 'keyword',
  messengerSetting = 'messengerSetting',
  pageSetup = 'pageSetup',
  quickReplySetting = 'quickReplySetting',
  sequence = 'sequence',
  tagsSetting = 'tagsSetting',
}

export const permissionActions = [
  'read',
  'create',
  'update',
  'delete',
] as const;

type PermissionAction = (typeof permissionActions)[number];

export const Permissions = Object.fromEntries(
  Object.values(PermissionsGroup).map((group) => [
    group,
    Object.fromEntries(
      permissionActions.map((action, index) => [action, 1 << index]),
    ),
  ]),
);

export function decodeJWT(token: string, secret: string = SecretKey) {
  try {
    return JWT.decode(token, secret);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

export function encodeJWT(
  user: Record<string, any>,
  secret: string = SecretKey,
) {
  return JWT.encode(user, secret, { alg: SupportedAlgorithms.HS256 });
}

export function hasPermission(
  userPermissions: Record<string, number> = {},
  module: PermissionsGroup,
  actions: PermissionAction[],
) {
  return actions.some((action) =>
    Boolean(userPermissions[module] & Permissions[module][action]),
  );
}

export function parseTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const hrsString = hrs > 0 ? `${hrs} giờ ` : '';
  const minsString = mins > 0 ? `${mins} phút ` : '';
  const secsString = secs > 0 ? `${secs} giây` : '';

  return `${hrsString}${minsString}${secsString}`.trim();
}
