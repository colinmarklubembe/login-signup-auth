import prisma from "../../prisma/client";

const createOrganization = async (data: any) => {
  return prisma.organization.create({
    data,
  });
};

const updateOrganization = async (organizationId: string, newData: any) => {
  return prisma.organization.update({
    where: {
      id: organizationId,
    },
    data: {
      ...newData,
    },
  });
};

const getOrganizationById = async (organizationId: string) => {
  return prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
    include: {
      userOrganizations: true,
    },
  });
};

const getAllOrganizations = async () => {
  return prisma.organization.findMany();
};

const getOrganizationByName = async (organizationName: string) => {
  return prisma.organization.findFirst({
    where: {
      name: {
        equals: organizationName,
        mode: "insensitive",
      },
    },
  });
};

const findOrganizationEmail = async (organizationEmail: string) => {
  return prisma.organization.findFirst({
    where: {
      organizationEmail: {
        equals: organizationEmail.toLowerCase(),
      },
    },
  });
};

const deleteOrganizationTransaction = async (
  organizationId: string,
  departmentIds: string[]
) => {
  return prisma.$transaction([
    prisma.userDepartment.deleteMany({
      where: {
        departmentId: {
          in: departmentIds,
        },
      },
    }),

    prisma.department.deleteMany({
      where: {
        id: {
          in: departmentIds,
        },
      },
    }),

    prisma.userOrganization.deleteMany({
      where: {
        organizationId,
      },
    }),
    prisma.organization.delete({
      where: {
        id: organizationId,
      },
    }),
  ]);
};

const findManyOrganizations = async (organizationIds: string[]) => {
  return prisma.organization.findMany({
    where: {
      id: {
        in: organizationIds,
      },
    },
  });
};

const fetchOrganizationIds = async (user: any) => {
  return user.userOrganizations.map((userOrg: any) => userOrg.organizationId);
};

const getUserOrganizationz = async (organizationIds: string[]) => {
  return prisma.organization.findMany({
    where: {
      id: {
        in: organizationIds,
      },
    },
  });
};

const findOrganizationById = async (organizationId: string) => {
  return prisma.organization.findUnique({
    where: { id: organizationId },
  });
};

const findOrganizationByName = async (name: string) => {
  return prisma.organization.findFirst({
    where: { name },
  });
};

export default {
  createOrganization,
  updateOrganization,
  getOrganizationById,
  getAllOrganizations,
  fetchOrganizationIds,
  getUserOrganizationz,
  findOrganizationById,
  findOrganizationByName,
  findManyOrganizations,
  getOrganizationByName,
  findOrganizationEmail,
  deleteOrganizationTransaction,
};
