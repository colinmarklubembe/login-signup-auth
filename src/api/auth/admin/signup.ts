import express, { Request, Response } from "express";
import { UserType } from "@prisma/client";
import { createUserAndAssignRole } from "../utils/createUserAndAssignRole";
import { validatePasswordStrength } from "../utils/checkPasswordStrength";

const router = express.Router();

router.post("/signup", async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  //validate password strength
  validatePasswordStrength(password, res);

  await createUserAndAssignRole(
    name,
    email,
    password,
    UserType.ADMIN,
    ["ADMIN"],
    res
  );
});

export default router;
