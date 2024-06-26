import { Request, Response } from "express";
import sendEmails from "../../../utils/sendEmails";
import generateToken from "../../../utils/generateToken";
import userService from "../services/userService";

const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await userService.findUserByEmail(email);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const emailData = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    // send email with password reset link
    const emailResponse: { status: number } =
      await sendEmails.sendForgotPasswordEmail(emailData);

    if (emailResponse.status === 200) {
      res.status(200).json({
        message: "Password reset link sent successfully!",
        success: true,
      });
    } else {
      res.status(422).json({ success: false, error: "Failed to send email" });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export default { forgotPassword };
