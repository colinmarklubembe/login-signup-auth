import { Resend } from "resend";
import { Response } from "express";
import jwt from "jsonwebtoken";

const resend = new Resend(process.env.RESEND_API_KEY);

const sendVerificationEmail = async (
  generateEmailToken: any,
  res: Response
) => {
  const decoded = jwt.verify(generateEmailToken, process.env.JWT_SECRET!) as {
    email: string;
    name: string;
    token: string;
  };
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: decoded.email,
      subject: "Account Verification",
      html: `
          <h1>Welcome to NOVA CRM!</h1>
          <p>Thank you for signing up, ${decoded.name}. We're excited to have you on board.</p>
          <p>To get started, please verify your email address by clicking the button below:</p>
          <div style="text-align: center;">
            <a href="http://localhost:4000/auth/api_verify/verify?token=${decoded.token}" 
               style="display: inline-block; padding: 10px 20px; font-size: 16px; color: white; background-color: blue; text-decoration: none; border-radius: 5px;">
               Verify Your Account
            </a>
          </div>
          <p>If the button above doesn't work, you can copy and paste the following link into your browser:</p>
          <p>http://localhost:4000/auth/api_verify/verify?token=${decoded.token}</p>
          <p>Best regards,<br>The Team</p>
        `,
    });

    res.status(201).send({
      message: "Account created successfully, please verify your email.",
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ error: "Failed to send verification email" });
  }
};

export default { sendVerificationEmail };
