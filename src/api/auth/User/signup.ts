import express, { Request, Response } from "express";
import { UserType } from "@prisma/client";
import {
  createUserAndAssignRole,
  verifyUser,
  reverifyUser,
} from "../utils/createUserAndAssignRole";
import zxcvbn from "zxcvbn";

const router = express.Router();

// password strength validation function
const validatePasswordStrength = (password: string) => {
  const minLength = 8;
  const result = zxcvbn(password);
  return password.length >= minLength && result.score >= 3;
};

router.post("/signup", async (req: Request, res: Response) => {
  const { name, email, password, roles } = req.body;
  if (!name || !email || !password || !roles) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // validate password strength
  if (!validatePasswordStrength(password)) {
    return res.status(400).json({
      error: "Password is too weak. It should be at least 8 characters long!",
    });
  }
  const validRoles = ["SALES", "CUSTOMER_SUPPORT", "MARKETING"];
  const userRoles = roles.filter((role: string) =>
    validRoles.includes(role.toUpperCase())
  );
  if (userRoles.length === 0) {
    return res.status(400).json({ error: "Invalid roles provided" });
  }
  await createUserAndAssignRole(
    name,
    email,
    password,
    UserType.USER,
    userRoles,
    res
  );
});

export default router;

// how to MAKE SURE THE ROLES ARE MADE UPPER CASE HOW
// THEY ARE IN THE DATABASE
