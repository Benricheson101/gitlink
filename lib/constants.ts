export const GITHUB_SCOPES = ['read:user', 'repo'];
export const DISCORD_SCOPES = ['identify', 'role_connections.write'];

export enum ApplicationRoleConnectionMetadataType {
  NumberLessThan = 1,
  NumberGreaterThan = 2,
  NumberEqual = 3,
  NumberNotEqual = 4,
  DateTimeLessThan = 5,
  DateTimeGreaterThan = 6,
  BooleanEqual = 7,
}
