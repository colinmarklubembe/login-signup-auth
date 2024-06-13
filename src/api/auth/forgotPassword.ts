import { Router } from "express";
import { Resend } from "resend";
import prisma from "../../prisma/client";
import jwt from "jsonwebtoken";
import sendEmails from "../../utils/sendEmails";
import { generateToken } from "../../utils/generateToken";
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

    const emailTokenData = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    const generateEmailToken = jwt.sign(
      emailTokenData,
      process.env.JWT_SECRET!
    );

    // send email with password reset link
    sendEmails.sendForgotPasswordEmail(generateEmailToken, res);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
