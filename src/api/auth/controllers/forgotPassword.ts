import { Request, Response } from "express";
import forgotPasswordService from "../services/forgotPassword";

const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    await forgotPasswordService.forgotPassword(email);
    res.status(200).json({
      message: "Password reset link sent successfully!",
      success: true,
    });
  } catch (error: any) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

export default { forgotPassword };
