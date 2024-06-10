// comparePassword.ts
import bcryptjs from "bcryptjs";

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcryptjs.compare(password, hashedPassword);
};
