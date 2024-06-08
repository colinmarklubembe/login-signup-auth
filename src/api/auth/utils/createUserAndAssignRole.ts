import { PrismaClient, UserType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Response } from "express";
import { generateToken } from "./generateToken";

const prisma = new PrismaClient();

export const createUserAndAssignRole = async (
  name: string,
  email: string,
  password: string,
  userType: UserType,
  roles: string[],
  res: Response
) => {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Find roles
    const roleEntities = await prisma.role.findMany({
      where: { name: { in: roles } },
    });

    // Validate roles
    if (roleEntities.length !== roles.length) {
      return res.status(400).json({ error: "One or more roles are invalid" });
    }

    // Create the user along with user roles in a single transaction
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        userType,
        createdAt: new Date(),
        roles: {
          create: roleEntities.map((role) => ({
            role: {
              connect: { id: role.id },
            },
          })),
        },
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    const token = generateToken(user.id);
    res.status(201).json({ token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};
