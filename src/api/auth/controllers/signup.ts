import { Request, Response } from "express";
import { validatePasswordStrength } from "../../../utils/checkPasswordStrength";
import { UserType } from "@prisma/client";
import signupService from "../services/signup";

const ownerSignup = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    validatePasswordStrength(password);

    const response: { status: number; message: string } =
      await signupService.createOwner(name, email, password, UserType.OWNER);

    res.status(response.status).json({
      message: response.message,
    });
  } catch (error: any) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

export default { ownerSignup };
