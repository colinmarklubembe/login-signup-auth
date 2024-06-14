// comparePassword.ts
import bcryptjs from "bcryptjs";

import bcrypt from "bcryptjs";

export const comparePassword = (
  password: string,
  hashedPassword: string
): boolean => {
  return bcrypt.compareSync(password, hashedPassword);
};
