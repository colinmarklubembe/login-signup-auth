import { Router, Request, Response } from "express";
import { verifyRefreshTokenMiddleware } from "../middleware/authenticateRefreshToken";

const router = Router();

interface AuthenticatedRequest extends Request {
  user?: any;
}

router.post(
  "/refresh-token",
  verifyRefreshTokenMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    const { token } = req.user;
  }
);
