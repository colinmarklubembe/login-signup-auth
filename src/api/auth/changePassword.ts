import { Router } from "express";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../prisma/client";
import { validatePasswordStrength } from "./utils/checkPasswordStrength";
import { hashPassword } from "./utils/hashPassword";

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

  const forgotPasswordToken = req.query.token as string;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(400).json({ error: "User does not exist" });
    }

    if (!forgotPasswordToken) {
      return res.status(400).json({ error: "Invalid token" });
    }

    try {
      const decoded = jwt.verify(
        forgotPasswordToken,
        process.env.JWT_SECRET!
      ) as {
        id: string;
        email: string;
        username: string;
        createdAt: string;
      };

      // check if both tokens match
      if (user?.forgotPasswordToken !== forgotPasswordToken) {
        return res.status(400).json({ error: "Tokens do not match" });
      }

      // check if token has expired
      const tokenAge = Date.now() - new Date(decoded.createdAt).getTime();
      console.log(tokenAge);

      if (tokenAge > 3600000) {
        return res.status(400).json({ error: "Token has expired" });
      }
    } catch (error) {
      return res.status(400).json({ error: "Invalid token" });
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
        forgotPasswordToken: null,
      },
    });
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    return res.status(400).json("Error resetting password");
  }
});

export default router;
