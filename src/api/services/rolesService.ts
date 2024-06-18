import prisma from "../../prisma/client";

const getRoles = () => {
  try {
    return prisma.role.findMany();
  } catch (error: any) {
    throw { status: error.status || 500, message: error.message };
  }
};

export default { getRoles };
