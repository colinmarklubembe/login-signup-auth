import express, { Request, Response } from "express";
import { UserType } from "@prisma/client";
import {
  createUserAndAssignRole,
  reverifyUser,
  verifyUser,
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
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // validate password strength
  if (!validatePasswordStrength(password)) {
    return res.status(400).json({
      error: "Password is too weak. It should be at least 8 characters long!",
    });
  }

  await createUserAndAssignRole(
    name,
    email,
    password,
    UserType.OWNER,
    ["OWNER"],
    res
  );
});

// verify user
router.get("/verify", async (req: Request, res: Response) => {
  const token = req.query.token as string;

  await verifyUser(token, res);
});

//reverify user
router.post("/reverify", async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  await reverifyUser(email, res);
});

export default router;
