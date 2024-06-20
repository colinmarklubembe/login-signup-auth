import { RoleAdapter } from "../interfaces/roleAdapter";
import prisma from "../../../prisma/client";

export class PrismaRoleAdapter implements RoleAdapter {
  async findRolesByName(roleNames: string[]): Promise<any[]> {
    return prisma.role.findMany({ where: { name: { in: roleNames } } });
  }

  async assignRolesToUser(
    userId: string,
    roles: any[],
    organizationId: string
  ): Promise<any> {
    return prisma.userOrganizationRole.createMany({
      data: roles.map((role) => ({ userId, organizationId, roleId: role.id })),
    });
  }
}
