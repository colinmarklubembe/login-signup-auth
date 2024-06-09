import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import zxcvbn from "zxcvbn";
import prisma from "../../prisma/client";

const router = Router();

// password strength validation function
const validatePasswordStrength = (password: string) => {
  const minLength = 8;
  const result = zxcvbn(password);
  return password.length >= minLength && result.score >= 3;
};

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

    // validate password strength
    if (!validatePasswordStrength(newPassword)) {
      return res.status(400).json({
        error: "Password is too weak. It should be at least 8 characters long!",
      });
    }

    // hash new password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);

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

    // validate password strength
    if (!validatePasswordStrength(newPassword)) {
      return res.status(400).json({
        error: "Password is too weak. It should be at least 8 characters long!",
      });
    }

    // hash new password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);

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
