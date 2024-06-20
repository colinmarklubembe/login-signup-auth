import prisma from "../../../prisma/client";
import { UserAdapter } from "../interfaces/userAdapter";

export class PrismaUserAdapter implements UserAdapter {
  async createUser(data: any): Promise<any> {
    return prisma.user.create({
      data,
      include: { userOrganizationRoles: { include: { role: true } } },
    });
  }

  async findUserByEmail(email: string): Promise<any> {
    return prisma.user.findUnique({ where: { email } });
  }
}
