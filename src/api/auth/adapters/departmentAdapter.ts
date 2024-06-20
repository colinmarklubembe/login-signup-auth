import { DepartmentAdapter } from "../interfaces/departmentAdapter";
import prisma from "../../../prisma/client";

export class PrismaDepartmentAdapter implements DepartmentAdapter {
  async findDepartmentById(departmentId: string): Promise<any> {
    return prisma.department.findUnique({ where: { id: departmentId } });
  }

  async addUserToDepartment(
    userId: string,
    departmentId: string
  ): Promise<any> {
    return prisma.userDepartment.create({ data: { userId, departmentId } });
  }
}
