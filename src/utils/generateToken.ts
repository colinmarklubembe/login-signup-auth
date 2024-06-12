import jwt from "jsonwebtoken";

export const generateToken = (tokenData: any) => {
  return jwt.sign(tokenData, process.env.JWT_SECRET!, {
    expiresIn: "1h",
  });
};
