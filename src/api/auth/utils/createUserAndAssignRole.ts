import { PrismaClient, UserType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Response } from "express";
import jwt from "jsonwebtoken";
import { Resend } from "resend";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

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
    const token = jwt.sign(tokenData, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });
    console.log("Token: ", token);
    // print out token expiry date
    console.log("Token expires : ", new Date(Date.now() + 3600000));

    // store the token in the database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken: token,
      },
    });

    // Send verification email
    try {
      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: user.email,
        subject: "Account Verification",
        html: `
          <h1>Welcome to NOVA CRM!</h1>
          <p>Thank you for signing up, ${user.name}. We're excited to have you on board.</p>
          <p>To get started, please verify your email address by clicking the button below:</p>
          <div style="text-align: center;">
            <a href="http://localhost:4000/auth/api_verify/verify?token=${token}" 
               style="display: inline-block; padding: 10px 20px; font-size: 16px; color: white; background-color: blue; text-decoration: none; border-radius: 5px;">
               Verify Your Account
            </a>
          </div>
          <p>If the button above doesn't work, you can copy and paste the following link into your browser:</p>
          <p>http://localhost:4000/auth/api_verify/verify?token=${token}</p>
          <p>Best regards,<br>The Team</p>
        `,
      });

      res.status(201).send({
        message: "Account created successfully, please verify your email.",
      });
    } catch (error) {
      console.error("Error sending email:", error);
      return res
        .status(500)
        .json({ error: "Failed to send verification email" });
    }
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};

const verifyUser = async (token: string, res: Response) => {
  console.log(token);

  if (!token) {
    return res.status(400).json({ error: "Invalid token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
      username: string;
      createdAt: string;
      userType: any;
    };

    // check if a token exists in the database
    const checkUser = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { verificationToken: true },
    });

    // check if both tokens match
    if (checkUser?.verificationToken !== token) {
      return res.status(400).json({ error: "Invalid token" });
    }

    // check if token has expired
    const tokenAge = Date.now() - new Date(decoded.createdAt).getTime();
    console.log(tokenAge);

    if (tokenAge > 3600000) {
      return res.status(400).json({ error: "Token has expired" });
    }

    const user = await prisma.user.update({
      where: { id: decoded.id },
      data: {
        isVerified: true,
        verificationToken: null,
        updatedAt: new Date().toISOString(),
      },
    });

    res.status(200).json({ message: "User verified successfully", user });
  } catch (error) {
    console.error("Error verifying user account: ", error);
    res.status(400).send({ message: "Error verifying user account" });
  }
};

const reverifyUser = async (email: string, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: "User is already verified" });
    }

    // create token data with timestamp
    const tokenData = {
      id: user.id,
      email: user.email,
      username: user.name,
      createdAt: user.createdAt,
      userType: user.userType,
    };

    // Create token
    const token = jwt.sign(tokenData, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    // update the token in the database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken: token,
      },
    });

    console.log("Token: ", token);

    // Send verification email
    try {
      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: user.email,
        subject: "Account Verification",
        html: `
      <h1>Welcome to NOVA CRM!</h1>
      <p>Thank you for signing up, ${user.name}. We're excited to have you on board.</p>
      <p>To get started, please verify your email address by clicking the button below:</p>
      <div style="text-align: center;">
        <a href="http://localhost:4000/auth/api_verify/verify?token=${token}" 
           style="display: inline-block; padding: 10px 20px; font-size: 16px; color: white; background-color: blue; text-decoration: none; border-radius: 5px;">
           Verify Your Account
        </a>
      </div>
      <p>If the button above doesn't work, you can copy and paste the following link into your browser:</p>
      <p>http://localhost:4000/auth/api_verify/verify?token=${token}</p>
      <p>Best regards,<br>The Team</p>
    `,
      });
      res.status(200).send({
        message: "Verification email has been resent.",
      });
    } catch (error) {
      console.error("Error sending email:", error);
      return res.status(400).json(error);
    }
  } catch (error) {
    console.error("Error re-verifying user account:", error);
    res.status(400).send({ message: "Error re-verifying user's account" });
  }
};

export { createUserAndAssignRole, verifyUser, reverifyUser };
