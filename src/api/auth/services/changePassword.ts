import bcryptjs from "bcryptjs";
import prisma from "../../../prisma/client";
import { validatePasswordStrength } from "../../../utils/checkPasswordStrength";
import { hashPassword } from "../../../utils/hashPassword";

const changePassword = async (
  oldPassword: string,
  newPassword: string,
  id: string
) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw { status: 400, message: "User does not exist" };
  }

  // compare old password
  const isMatch = await bcryptjs.compare(oldPassword, user.password);
  if (!isMatch) {
    throw { status: 400, message: "Invalid old password" };
  }

  const password = newPassword;

  // validate password strength
  validatePasswordStrength(password);

  // hash new password
  const hashedPassword = await hashPassword(password);

  // update password
  const updatedPassword = await prisma.user.update({
    where: { id },
    data: {
      password: hashedPassword,
      updatedAt: new Date().toISOString(),
    },
  });

  return updatedPassword;
};

const resetPassword = async (newPassword: string, id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw { status: 400, message: "User does not exist" };
  }

  const password = newPassword;

  // validate password strength
  validatePasswordStrength(password);

  // hash new password
  const hashedPassword = await hashPassword(password);

  // update password
  const updatedPassword = await prisma.user.update({
    where: { id },
    data: {
      password: hashedPassword,
      updatedAt: new Date().toISOString(),
    },
  });

  return updatedPassword;
};

export default { changePassword, resetPassword };
