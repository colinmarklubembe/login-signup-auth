import { Response } from "express";
import prisma from "../../prisma/client";

const getRoles = (res: Response) => {
  try {
    return prisma.role.findMany();
  } catch (error) {
    console.error("Error fetching roles", error);
    res.status(500).send("Error fetching roles");
  }
};

export default { getRoles };
