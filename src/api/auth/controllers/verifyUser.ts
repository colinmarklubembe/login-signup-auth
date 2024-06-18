import { Request, Response } from "express";
import verifyUserService from "../services/verifyUser";

const verifyUser = async (req: Request, res: Response) => {
  try {
    const token = req.query.token as string;

    const response: { status: number; message: string } =
      await verifyUserService.verifyUser(token);
    res.status(response.status).redirect("http://localhost:3000/verifiedEmail");
  } catch (error: any) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

const reverifyUser = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    await verifyUserService.reverifyUser(email);
  } catch (error: any) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

export default { verifyUser, reverifyUser };
