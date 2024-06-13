import prisma from "../../prisma/client";

const createOrganization = async (name: string) => {
  return prisma.organization.create({
    data: {
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  });
};

const updateOrganization = async (id: string, name: string) => {
  return prisma.organization.update({
    where: {
      id,
    },
    data: {
      name,
      updatedAt: new Date().toISOString(),
    },
  });
};

const getOrganizationById = async (id: string) => {
  return prisma.organization.findUnique({
    where: {
      id,
    },
  });
};

const getAllOrganizations = async () => {
  return prisma.organization.findMany();
};

const deleteOrganization = async (id: string) => {
  return prisma.organization.delete({
    where: {
      id,
    },
  });
};

export default {
  createOrganization,
  updateOrganization,
  getOrganizationById,
  getAllOrganizations,
  deleteOrganization,
};
