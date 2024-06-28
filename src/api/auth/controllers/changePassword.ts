import { Request, Response } from "express";
import userService from "../services/userService";
import bcryptjs from "bcryptjs";

import { hashPassword, checkPasswordStrength } from "../../../utils";

const changePassword = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await userService.findUserById(id);

    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    // compare old password
    const isMatch = await bcryptjs.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid old password" });
    }

    const password = newPassword;

    // validate password strength
    checkPasswordStrength.validatePasswordStrength(password);

    // hash new password
    const hashedPassword = await hashPassword(password);

    const userId = id;

    const newData = {
      password: hashedPassword,
      updatedAt: new Date().toISOString(),
    };

    // update password
    await userService.updateUser(userId, newData);

    res.status(200).json({
      message: "Password changed successfully!",
      success: true,
    });
  } catch (error: any) {
    res.json({ message: error.message });
  }
};

const resetPassword = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await userService.findUserById(id);

    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    const password = newPassword;

    // validate password strength
    checkPasswordStrength.validatePasswordStrength(password);

    // hash new password
    const hashedPassword = await hashPassword(password);

    const userId = id;
    const newData = {
      password: hashedPassword,
      updatedAt: new Date().toISOString(),
    };

    // update password
    const updatedPassword = await userService.updateUser(userId, newData);

    res.status(200).json({
      message: "Password reset successfully!",
      success: true,
    });
  } catch (error: any) {
    res.json({ message: error.message });
  }
};

export default { changePassword, resetPassword };
