export interface RoleAdapter {
  findRolesByName(roleNames: string[]): Promise<any[]>;
  assignRolesToUser(
    userId: string,
    roles: any[],
    organizationId: string
  ): Promise<any>;
}
