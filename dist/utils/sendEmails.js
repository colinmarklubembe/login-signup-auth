"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const resend_1 = require("resend");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("dotenv").config();
const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
const sendVerificationEmail = async (generateEmailToken, res) => {
    const decoded = jsonwebtoken_1.default.verify(generateEmailToken, process.env.JWT_SECRET);
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
            <a href="http://localhost:4000/api/v1/auth/verify?token=${decoded.token}" 
               style="display: inline-block; padding: 10px 20px; font-size: 16px; color: white; background-color: blue; text-decoration: none; border-radius: 5px;">
               Verify Your Account
            </a>
          </div>
          <p>If the button above doesn't work, you can copy and paste the following link into your browser:</p>
          <p>http://localhost:4000/api/v1/auth/verify?token=${decoded.token}</p>
          <p>Best regards,<br>The Team</p>
        `,
        });
        res.status(201).send({
            message: "Account created successfully, please verify your email.",
        });
    }
    catch (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ error: "Failed to send verification email" });
    }
};
const sendUpdatedProfileEmail = async (generateEmailToken, res) => {
    const decoded = jsonwebtoken_1.default.verify(generateEmailToken, process.env.JWT_SECRET);
    try {
        await resend.emails.send({
            from: "onboarding@resend.dev",
            to: decoded.email,
            subject: "Your Profile Has Been Updated",
            html: `<div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Profile Update Notification</h2>
          <p>Dear ${decoded.name},</p>
          <p>We wanted to let you know that your profile has been successfully updated. Here are the details:</p>
          <ul>
            <li><strong>Name:</strong> ${decoded.name}</li>
            <li><strong>Email:</strong> ${decoded.email}</li>
          </ul>
          <p>You can view and manage your profile using the following link:</p>
          <p><a href="#" style="color: #1a73e8;">View Profile</a></p>
          <p>If you did not make this change or if you have any concerns, please contact our support team immediately.</p>
          <p>Thank you for keeping your profile up-to-date!</p>
          <p>Best regards,</p>
          <p>The Nova Team</p>
          <hr>
          <p style="font-size: 0.9em;">If you have any questions, feel free to reach out to our support team at <a href="#">$----------</a>.</p>
        </div>`,
        });
    }
    catch (error) {
        console.error("Error sending update profile email:", error);
        return res
            .status(500)
            .json({ error: "Failed to send update profile email" });
    }
};
const sendForgotPasswordEmail = async (generateEmailToken, res) => {
    const decoded = jsonwebtoken_1.default.verify(generateEmailToken, process.env.JWT_SECRET);
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
          <a href="http://localhost:3000/reset-password" 
             style="display: inline-block; padding: 10px 20px; font-size: 16px; color: white; background-color: #007BFF; text-decoration: none; border-radius: 5px;">
             Reset Your Password
          </a>
        </div>
        <p>If you did not request a password reset, please ignore this email. Your password will remain unchanged and no further action is required.</p>
        <p>If the button above doesn't work, you can copy and paste the following link into your browser:</p>
        <p style="word-wrap: break-word;">
          <a href="http://localhost:3000/reset-password" style="color: #007BFF;">
            http://localhost:3000/reset-password
          </a>
        </p>
        <p>Thank you,<br>The NOVA CRM Team</p>
      </div>
    `,
            // make a call to the backend to reset the user's password(http://localhost:4000/auth/api/reset-password/:id)
        });
        res
            .status(200)
            .json({ message: "Email sent successfully", token: generateEmailToken });
    }
    catch (error) {
        console.error("Error sending email:", error);
        return res.status(400).json(error);
    }
};
const sendInviteEmail = async (generateEmailToken, res) => {
    const decoded = jsonwebtoken_1.default.verify(generateEmailToken, process.env.JWT_SECRET);
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
            <a href="http://localhost:3000/login" 
               style="display: inline-block; padding: 10px 20px; font-size: 16px; color: white; background-color: #007BFF; text-decoration: none; border-radius: 5px;">
               Accept Invitation and Login
            </a>
          </div>
          <p>If the button above doesn't work, you can copy and paste the following link into your browser:</p>
          <p style="word-wrap: break-word;">
            <a href="http://localhost:3000/login" style="color: #007BFF;">
              http://localhost:3000/login
            </a>
          </p>
          <p>Thank you,<br>The NOVA CRM Team</p>
        </div>
      `,
            // make a call to the backend login api (http://localhost:4000/api/v1/users/login)
        });
    }
    catch (error) {
        console.error("Error sending invitation email:", error);
        return res.status(500).json({ error: "Failed to send invitation email" });
    }
};
exports.default = {
    sendVerificationEmail,
    sendForgotPasswordEmail,
    sendInviteEmail,
    sendUpdatedProfileEmail,
};
