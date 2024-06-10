import bcryptjs from "bcryptjs";
import { Response } from "express-serve-static-core";

export const comparePassword = async (
  password: string,
  hashedPassword: string,
  res: Response
) => {
  const isMatch = await bcryptjs.compare(password, hashedPassword);

  if (!isMatch) {
    return res.status(400).json({ error: "Invalid credentials" });
  }
};
