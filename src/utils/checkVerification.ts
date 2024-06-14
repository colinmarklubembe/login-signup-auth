import prisma from "../prisma/client";
import jwt from "jsonwebtoken";
import sendEmails from "./sendEmails";
import { Response } from "express";
import { generateToken } from "./generateToken";

const verifyUser = async (token: string, res: Response) => {
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

    res.redirect("http://localhost:3000/verifiedEmail");
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
    const token = generateToken(tokenData);

    // update the token in the database
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
    console.error("Error re-verifying user account:", error);
    res.status(400).send({ message: "Error re-verifying user's account" });
  }
};

export default { verifyUser, reverifyUser };
