import prisma from "../../prisma/client";

const createWorkspace = async (name: string, description: string) => {
  return prisma.workspace.create({
    data: {
      name,
      description,
    },
  });
};

export default {
  createWorkspace,
};
