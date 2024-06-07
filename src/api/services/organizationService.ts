import prisma from "../../prisma/client";

const createOrganization = async (
  name: string,
  adminId: string
) => {
  return prisma.organization.create({
    data: {
      name,
      adminId,
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
  
}

export default {
  createOrganization,
  updateOrganization,
};
