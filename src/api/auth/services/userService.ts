import prisma from "../../../prisma/client";

const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
    include: {
      userOrganizations: {
        include: {
          organization: true,
        },
      },
      userDepartments: {
        include: {
          department: {
            include: {
              organization: true,
            },
          },
        },
      },
    },
  });
};

const findUserById = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      userOrganizations: { include: { organization: true } },
      userDepartments: { include: { department: true } },
    },
  });
};

const createUser = async (data: any) => {
  return prisma.user.create({
    data,
    include: { userOrganizations: { include: { organization: true } } },
  });
};

const addUserToDepartmentWithRole = async (
  userId: string,
  departmentId: string
) => {
  return prisma.userDepartment.create({
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
    },
  });
};

const updateUser = async (userId: string, newData: any) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      ...newData,
    },
  });
};

const addUserToDepartment = async (userId: string, departmentId: string) => {
  return prisma.userDepartment.create({
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
    },
  });
};

const assignRoleToUser = async (
  userId: string,
  roleId: string,
  departmentId: string
) => {
  return prisma.userDepartment.update({
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

const addUserToOrganization = async (
  userId: string,
  organizationId: string
) => {
  return prisma.userOrganization.create({
    data: {
      user: {
        connect: {
          id: userId,
        },
      },
      organization: {
        connect: {
          id: organizationId,
        },
      },
    },
  });
};

const findUserOrganization = async (userId: string, organizationId: string) => {
  return prisma.userOrganization.findFirst({
    where: {
      userId,
      organizationId,
    },
  });
};

const deleteUserTransaction = async (userId: string) => {
  return prisma.$transaction([
    prisma.userOrganization.deleteMany({
      where: {
        userId: userId,
      },
    }),
    prisma.userDepartment.deleteMany({
      where: {
        userId: userId,
      },
    }),
    prisma.user.delete({
      where: {
        id: userId,
      },
    }),
  ]);
};

export default {
  findUserByEmail,
  createUser,
  addUserToDepartment,
  assignRoleToUser,
  addUserToDepartmentWithRole,
  addUserToOrganization,
  updateUser,
  findUserById,
  findUserOrganization,
  deleteUserTransaction,
};
