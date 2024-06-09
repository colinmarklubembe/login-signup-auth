import { Router, Request, Response } from "express";
import { verifyUser, reverifyUser } from "./utils/createUserAndAssignRole";

const router = Router();

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
