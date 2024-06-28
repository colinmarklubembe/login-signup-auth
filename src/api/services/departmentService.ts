import prisma from "../../prisma/client";

const findOrganizationDepartment = async (
  name: string,
  organizationId: string
) => {
  return prisma.department.findFirst({
    where: {
      name,
      organizationId,
    },
  });
};

const createDepartment = async (data: any) => {
  return prisma.department.create({
    data,
  });
};

const updateDepartment = async (departmentId: string, newData: any) => {
  return prisma.department.update({
    where: { id: departmentId },
    data: {
      ...newData,
    },
  });
};

const deleteDepartmentTransaction = async (departmentId: string) => {
  return prisma.$transaction([
    prisma.userDepartment.deleteMany({
      where: {
        departmentId,
      },
    }),
    prisma.department.delete({
      where: {
        id: departmentId,
      },
    }),
  ]);
};

const getAllDepartments = async () => {
  return prisma.department.findMany();
};

const getDepartmentsByOrganization = async (organizationId: string) => {
  return await prisma.department.findMany({
    where: {
      organizationId,
    },
    include: {
      userDepartments: true,
    },
  });
};

const getUsersInDepartment = async (departmentId: string) => {
  return prisma.userDepartment.findMany({
    where: {
      departmentId,
    },
    include: {
      user: true,
    },
  });
};

const findDepartmentById = async (departmentId: string) => {
  return prisma.department.findUnique({
    where: { id: departmentId },
  });
};

export default {
  createDepartment,
  updateDepartment,
  getAllDepartments,
  getDepartmentsByOrganization,
  getUsersInDepartment,
  findDepartmentById,
  findOrganizationDepartment,
  deleteDepartmentTransaction,
};
