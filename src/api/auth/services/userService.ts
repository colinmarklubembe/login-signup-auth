import prisma from "../../../prisma/client";

const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({ where: { email } });
};

const createUser = async (data: any) => {
  return prisma.user.create({
    data,
    include: { userOrganizationRoles: { include: { role: true } } },
  });
};

const addUserToDepartmentWithRole = async (
  userId: string,
  departmentId: string,
  roleId: string
) => {
  return prisma.userDepartmentRole.create({
    data: {
      user: {
        connect: {
          id: userId,
        },
      },
      department: {
        connect: {
          id: departmentId,
        },
      },
      role: {
        connect: {
          id: roleId,
        },
      },
    },
  });
};

const updateUser = async (userId: string, newData: any) => {
  return prisma.user.update({
    where: { id: userId },
    data: newData,
  });
};

const addUserToDepartment = async (userId: string, departmentId: string) => {
  return prisma.userDepartmentRole.create({
    data: {
      user: {
        connect: {
          id: userId,
        },
      },
      department: {
        connect: {
          id: departmentId,
        },
      },
      role: null,
    },
  });
};

const assignRoleToUser = async (
  userId: string,
  roleId: string,
  departmentId: string
) => {
  return prisma.userDepartmentRole.update({
    where: {
      userId_departmentId: {
        userId,
        departmentId,
      },
    },
    data: {
      role: {
        connect: {
          id: roleId,
        },
      },
    },
  });
};

export default {
  findUserByEmail,
  createUser,
  addUserToDepartment,
  assignRoleToUser,
  addUserToDepartmentWithRole,
  updateUser,
};
