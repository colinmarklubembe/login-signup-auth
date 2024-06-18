import prisma from "../../../prisma/client";
import jwt from "jsonwebtoken";
import sendEmails from "../../../utils/sendEmails";

const updateProfile = async (name: string, email: string, id: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    throw { status: 404, message: "User does not exist" };
  }

  if (!name) {
    throw { status: 400, message: "Missing required fields" };
  }

  // send update profile email to user
  const emailTokenData = {
    email: user.email,
    name: user.name,
  };

  const generateEmailToken = jwt.sign(emailTokenData, process.env.JWT_SECRET!);
  // Send invitation email
  sendEmails.sendUpdatedProfileEmail(generateEmailToken);

  const updatedUser = await prisma.user.update({
    where: {
      id,
    },
    data: {
      name,
      email,
      updatedAt: new Date().toISOString(),
    },
  });
  return updatedUser;
};

export default { updateProfile };
