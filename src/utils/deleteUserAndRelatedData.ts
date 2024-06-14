import prisma from "../prisma/client";
import { Response } from "express";

const deleteUserAndRelatedData = async (res: Response, id: string) => {
  try {
    // check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ error: "User does not exist" });
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
    res.status(200).json({ message: "User and related data deleted" });
  } catch (error) {
    console.error("Error deleting user and related data", error);
    res.status(500).send("Error deleting user and related data");
  }
};

export default { deleteUserAndRelatedData };
