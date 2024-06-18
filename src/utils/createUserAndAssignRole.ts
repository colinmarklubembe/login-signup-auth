import { PrismaClient, UserType } from "@prisma/client";
import { Response } from "express";
import jwt from "jsonwebtoken";
import { generateToken } from "./generateToken";
import { hashPassword } from "./hashPassword";
import sendEmails from "./sendEmails";

const prisma = new PrismaClient();

const createUserAndAssignRole = async (
  name: string,
  email: string,
  password: string,
  userType: UserType,
  res: Response
) => {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const hashedPassword = await hashPassword(password);

    // Create the user along with user roles in a single transaction
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        userType,
        createdAt: new Date().toISOString(),
      },
    });

    // create token data with timestamp
    const tokenData = {
      id: user.id,
      email: user.email,
      username: user.name,
      createdAt: new Date().toISOString(), // temporarily store the timestamp of the token creation
      userType: user.userType,
    };

    // create token
    const token = generateToken(tokenData);

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
    sendEmails.sendVerificationEmail(generateEmailToken);
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
  organizationId: string,
  userOrganizationRoles: string[],
  departmentName: string,
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
      where: { name: { in: userOrganizationRoles } },
    });

    // Validate roles
    if (roleEntities.length !== userOrganizationRoles.length) {
      return res.status(400).json({ error: "One or more roles are invalid" });
    }

    // get the deparmtnet id with the department name provided
    const department = await prisma.department.findFirst({
      where: { name: departmentName },
    });

    if (!department) {
      return res.status(400).json({ error: "Department not found" });
    }

    // check if the department belongs to the organization
    if (department.organizationId !== organizationId) {
      return res
        .status(400)
        .json({ error: "Department does not belong to the organization" });
    }

    // get the name of the organization with the id of organizationId
    const organization = await prisma.organization.findFirst({
      where: { id: organizationId },
    });

    // Create the user along with user roles in a single transaction
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        userType,
        isVerified: true,
        createdAt: new Date().toISOString(),
        userOrganizationRoles: {
          create: roleEntities.map((role) => ({
            organization: {
              connect: { id: organizationId },
            },
            role: {
              connect: { id: role.id },
            },
          })),
        },
      },
      include: {
        userOrganizationRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    // add user to Department
    const userDepartment = await prisma.userDepartment.create({
      data: {
        userId: user.id,
        departmentId: department.id,
      },
    });

    const emailTokenData = {
      email: user.email,
      name: user.name,
      password: defaultPassword,
      department: department.name,
      organization: organization?.name,
    };

    const generateEmailToken = jwt.sign(
      emailTokenData,
      process.env.JWT_SECRET!
    );
    // Send invitation email
    sendEmails.sendInviteEmail(generateEmailToken);

    // return the created user in the json response
    res.status(200).json({
      message: "Invitation email sent successfully!",
      success: true,
      user,
      userDepartment,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};

export { createUserAndAssignRole, createInvitedUser };
