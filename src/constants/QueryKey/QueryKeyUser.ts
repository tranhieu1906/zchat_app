export const QueryKeyUser = {
  getListUsers: () => `list-users`,
  getPermissions: () => `permissions`,
  getSystemsByCorporation: (corporation: string) =>
    `systems-by-corporation-${corporation}`,
  getTeamMembers: (id: string) => `team-members-${id}`,
};
