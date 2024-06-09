import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";
import jwt from "jsonwebtoken";
import prisma from "../../prisma/client";
require("dotenv").config();

const router = Router();
const resend = new Resend(process.env.RESEND_API_KEY);

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
        forgotPasswordToken: token,
      },
    });

    // send email with password reset link
    try {
      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: user.email,
        subject: "Reset Your Password",
        html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h1 style="color: #333;">Password Reset Request</h1>
        <p>Hello ${user.name},</p>
        <p>We received a request to reset your password for your NOVA CRM account associated with this email address. If you made this request, please click the button below to reset your password:</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="http://localhost:4000/auth/api/reset-password/${user.id}?token=${token}" 
             style="display: inline-block; padding: 10px 20px; font-size: 16px; color: white; background-color: #007BFF; text-decoration: none; border-radius: 5px;">
             Reset Your Password
          </a>
        </div>
        <p>If you did not request a password reset, please ignore this email. Your password will remain unchanged and no further action is required.</p>
        <p>If the button above doesn't work, you can copy and paste the following link into your browser:</p>
        <p style="word-wrap: break-word;">
          <a href="http://localhost:4000/auth/api/reset-password/${user.id}?token=${token}" style="color: #007BFF;">
            http://localhost:4000/auth/api/reset-password/${user.id}?token=${token}
          </a>
        </p>
        <p>Thank you,<br>The NOVA CRM Team</p>
      </div>
    `,
      });
      res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
      console.error("Error sending email:", error);
      return res.status(400).json(error);
    }
  } catch (error) {}
});

export default router;
