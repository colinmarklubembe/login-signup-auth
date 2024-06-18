import prisma from "../../../prisma/client";

const deleteUser = async (id: string) => {
  try {
    // check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw { status: 404, message: "User does not exist" };
    }

    // start a transaction
    await prisma.$transaction([
      prisma.userOrganizationRole.deleteMany({
        where: {
          userId: user.id,
        },
      }),
      prisma.userDepartment.deleteMany({
        where: {
          userId: user.id,
        },
      }),
      prisma.user.delete({
        where: {
          id: user.id,
        },
      }),
    ]);
    throw { status: 200, message: "User and related data deleted" };
  } catch (error) {
    console.error("Error deleting user and related data", error);
    throw { status: 500, message: "Error deleting user and related data" };
  }
};

export default { deleteUser };
