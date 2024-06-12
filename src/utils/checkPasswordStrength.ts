import zxcvbn from "zxcvbn";
import { Response } from "express";

export const validatePasswordStrength = (password: string, res: Response) => {
  const minLength = 8;
  const result = zxcvbn(password);
  const passwordStrength = password.length >= minLength && result.score >= 3;

  if (!passwordStrength) {
    return res.status(400).json({
      error: "Password is too weak. It should be at least 8 characters long!",
    });
  }
};
