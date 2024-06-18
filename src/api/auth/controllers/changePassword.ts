import { Request, Response } from "express";
import changePasswordService from "../services/changePassword";

const changePassword = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;

  try {
    await changePasswordService.changePassword(oldPassword, newPassword, id);
    res.status(200).json({
      message: "Password changed successfully!",
      success: true,
    });
  } catch (error: any) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

const resetPassword = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  try {
    await changePasswordService.resetPassword(newPassword, id);
    res.status(200).json({
      message: "Password reset successfully!",
      success: true,
    });
  } catch (error: any) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

export default { changePassword, resetPassword };
