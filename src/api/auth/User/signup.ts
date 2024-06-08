import express, { Request, Response } from "express";
import { UserType } from "@prisma/client";
import {
  createUserAndAssignRole,
  verifyUser,
  reverifyUser,
} from "../utils/createUserAndAssignRole";

const router = express.Router();

router.post("/signup", async (req: Request, res: Response) => {
  const { name, email, password, roles } = req.body;
  if (!name || !email || !password || !roles) {
    return res.status(400).json({ error: "Missing required fields" });
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

// how to MAKE SURE THE ROLES ARE MADE UPPER CASE HOW
// THEY ARE IN THE DATABASE
