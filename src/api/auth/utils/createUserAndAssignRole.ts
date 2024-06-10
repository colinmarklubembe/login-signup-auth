import { PrismaClient, UserType } from "@prisma/client";
import { Response } from "express";
import jwt from "jsonwebtoken";
import { generateToken } from "../utils/generateToken";
import { hashPassword } from "../utils/hashPassword";
import sendEmails from "./sendEmails";

const prisma = new PrismaClient();

const createUserAndAssignRole = async (
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

    const hashedPassword = await hashPassword(password);

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
        createdAt: new Date().toISOString(),
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

    // create token data with timestamp
    const tokenData = {
      id: user.id,
      email: user.email,
      username: user.name,
      createdAt: new Date().toISOString(),
      userType: user.userType,
    };

    // create token
    const token = generateToken(tokenData);
    console.log("Token: ", token);
    console.log("Token expires : ", new Date(Date.now() + 3600000));

    // store the token in the database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken: token,
      },
    });

    const emailTokenData = {
      email: user.email,
      name: user.name,
      token,
    };

    const generateEmailToken = jwt.sign(
      emailTokenData,
      process.env.JWT_SECRET!
    );
    // Send verification email
    sendEmails.sendVerificationEmail(generateEmailToken, res);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};

const createInvitedUser = async (
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

    const defaultPassword = password;
    const hashedPassword = await hashPassword(password);

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
        isVerified: true,
        createdAt: new Date().toISOString(),
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

    const emailTokenData = {
      email: user.email,
      name: user.name,
      password: defaultPassword,
    };

    const generateEmailToken = jwt.sign(
      emailTokenData,
      process.env.JWT_SECRET!
    );
    // Send invitation email
    sendEmails.sendInviteEmail(generateEmailToken, res);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};

export { createUserAndAssignRole, createInvitedUser };
