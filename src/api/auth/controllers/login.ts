import { Request, Response } from "express";
import loginService from "../services/login";

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const userAndToken = await loginService.login(email, password);

    // Set the token in the Authorization header
    res.setHeader("Authorization", `Bearer ${userAndToken.loginToken}`);

    res.status(200).json({
      message: `Logged in successfully as ${email}`,
      success: true,
      user: userAndToken.user,
      token: userAndToken.loginToken,
    });
  } catch (error: any) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

export default { login };
