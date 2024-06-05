import prisma from "../../prisma/client";

const createWorkspace = async (
  name: string,
  description: string,
  adminId: string
) => {
  return prisma.workspace.create({
    data: {
      name,
      description,
      adminId,
    },
  });
};

export default {
  createWorkspace,
};
