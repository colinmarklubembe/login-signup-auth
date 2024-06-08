import express, { Request, Response } from "express";
import { UserType } from "@prisma/client";
import {
  createUserAndAssignRole,
  verifyUser,
  reverifyUser,
} from "../utils/createUserAndAssignRole";

const router = express.Router();

router.post("/signup", async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  await createUserAndAssignRole(
    name,
    email,
    password,
    UserType.ADMIN,
    ["ADMIN"],
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
