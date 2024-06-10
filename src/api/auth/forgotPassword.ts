import { Router } from "express";
import { Resend } from "resend";
import prisma from "../../prisma/client";
import jwt from "jsonwebtoken";
import sendEmails from "./utils/sendEmails";
import { generateToken } from "./utils/generateToken";
require("dotenv").config();

const router = Router();

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ error: "User does not exist" });
    }

    // create token data with timestamp
    const tokenData = {
      id: user.id,
      email: user.email,
      username: user.name,
      createdAt: new Date().toISOString(),
    };

    // create token
    const token = generateToken(tokenData);
    console.log("Token: ", token);
    // print out token expiry date
    console.log("Token expires : ", new Date(Date.now() + 3600000));

    // store the token in the database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        forgotPasswordToken: token,
      },
    });

    const emailTokenData = {
      id: user.id,
      email: user.email,
      name: user.name,
      token,
    };

    const generateEmailToken = jwt.sign(
      emailTokenData,
      process.env.JWT_SECRET!
    );

    // send email with password reset link
    sendEmails.sendForgotPasswordEmail(generateEmailToken, res);
  } catch (error) {
    console.log("An error occurred. Please retry!", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
