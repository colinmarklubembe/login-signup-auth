import { Router } from "express";
import bcryptjs from "bcryptjs";
import prisma from "../../prisma/client";
import { validatePasswordStrength } from "../../utils/checkPasswordStrength";
import { hashPassword } from "../../utils/hashPassword";

const router = Router();

// update password
router.put("/change-password/:id", async (req, res) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(400).json({ error: "User does not exist" });
    }

    // compare old password
    const isMatch = await bcryptjs.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid old password" });
    }

    const password = newPassword;

    // validate password strength
    validatePasswordStrength(password, res);

    // hash new password
    const hashedPassword = await hashPassword(password);

    // update password
    const updatedPassword = await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        updatedAt: new Date().toISOString(),
      },
    });
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    return res.status(400).json("Error updating password");
  }
});

// reset password
router.put("/reset-password/:id", async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(400).json({ error: "User does not exist" });
    }

    const password = newPassword;

    // validate password strength
    validatePasswordStrength(password, res);

    // hash new password
    const hashedPassword = await hashPassword(password);

    // update password
    const updatedPassword = await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
      },
    });
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    return res.status(400).json("Error resetting password");
  }
});

export default router;
