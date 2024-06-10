import { generateToken } from "./generateToken";
import { Resend } from "resend";
import { Response } from "express";
import jwt from "jsonwebtoken";
require("dotenv").config();

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

const sendForgotPasswordEmail = async (
  generateEmailToken: any,
  res: Response
) => {
  const decoded = jwt.verify(generateEmailToken, process.env.JWT_SECRET!) as {
    id: string;
    email: string;
    name: string;
    token: string;
  };
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: decoded.email,
      subject: "Reset Your Password",
      html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h1 style="color: #333;">Password Reset Request</h1>
        <p>Hello ${decoded.name},</p>
        <p>We received a request to reset your password for your NOVA CRM account associated with this email address. If you made this request, please click the button below to reset your password:</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="http://localhost:4000/auth/api/reset-password/${decoded.id}?token=${decoded.token}" 
             style="display: inline-block; padding: 10px 20px; font-size: 16px; color: white; background-color: #007BFF; text-decoration: none; border-radius: 5px;">
             Reset Your Password
          </a>
        </div>
        <p>If you did not request a password reset, please ignore this email. Your password will remain unchanged and no further action is required.</p>
        <p>If the button above doesn't work, you can copy and paste the following link into your browser:</p>
        <p style="word-wrap: break-word;">
          <a href="http://localhost:4000/auth/api/reset-password/${decoded.id}?token=${decoded.token}" style="color: #007BFF;">
            http://localhost:4000/auth/api/reset-password/${decoded.id}?token=${decoded.token}
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
};

const sendInviteEmail = async (generateEmailToken: string, res: Response) => {
  const decoded = jwt.verify(generateEmailToken, process.env.JWT_SECRET!) as {
    email: string;
    name: string;
    password: string;
  };

  try {
    // Send the invitation email
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: decoded.email,
      subject: "You're Invited to Join NOVA CRM",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h1 style="color: #333;">Invitation to Join NOVA CRM</h1>
          <p>Hello ${decoded.name},</p>
          <p>You have been invited to join NOVA CRM. We're excited to have you on board.</p>
          <p>Your default password for the first login is: <strong>${decoded.password}</strong></p>
          <p>You will login using the current email to which this invite was sent.</p>
          <p>Please click the button below to accept the invitation and get started:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="http://localhost:4000/auth/api_login/login" 
               style="display: inline-block; padding: 10px 20px; font-size: 16px; color: white; background-color: #007BFF; text-decoration: none; border-radius: 5px;">
               Accept Invitation and Login
            </a>
          </div>
          <p>If the button above doesn't work, you can copy and paste the following link into your browser:</p>
          <p style="word-wrap: break-word;">
            <a href="http://localhost:4000/auth/api_login/login" style="color: #007BFF;">
              http://localhost:4000/auth/api_login/login
            </a>
          </p>
          <p>Thank you,<br>The NOVA CRM Team</p>
        </div>
      `,
    });

    res.status(200).json({
      message: `Invitation email sent successfully to email ${decoded.email}`,
    });
  } catch (error) {
    console.error("Error sending invitation email:", error);
    return res.status(500).json({ error: "Failed to send invitation email" });
  }
};

export default {
  sendVerificationEmail,
  sendForgotPasswordEmail,
  sendInviteEmail,
};
