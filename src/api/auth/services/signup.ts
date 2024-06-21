import prisma from "../../../prisma/client";
import { UserType } from "@prisma/client";
import { generateToken } from "../../../utils/generateToken";
import { hashPassword } from "../../../utils/hashPassword";
import sendEmails from "../../../utils/sendEmails";
import jwt from "jsonwebtoken";

const createUser = async (
  name: string,
  email: string,
  password: string,
  userType: UserType
) => {
  // check if user already exists
  const checkUser = await prisma.user.findUnique({
    where: { email },
  });

  if (checkUser) {
    throw { status: 400, message: "Email already in use" };
  }

  const hashedPassword = await hashPassword(password);

  // Create the user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      userType,
      createdAt: new Date().toISOString(),
    },
  });

  // create token data with timestamp
  const tokenData = {
    id: user.id,
    email: user.email,
    username: user.name,
    createdAt: new Date().toISOString(), // temporarily store the timestamp of the token creation
    userType: user.userType,
  };

  // create token
  const token = generateToken(tokenData);

  // store the token in the database
  await prisma.user.update({
    where: { id: user.id },
    data: {
      verificationToken: token,
    },
  });

  const emailTokenData = {
    email: user.email,
    name: user.name,
    token,
  };

  const generateEmailToken = jwt.sign(emailTokenData, process.env.JWT_SECRET!);

  // send email
  const emailResponse: { status: number } =
    await sendEmails.sendVerificationEmail(generateEmailToken);

  if (emailResponse.status === 200) {
    return {
      status: 200,
      message: "Verification email sent successfully! Please verify your email",
    };
  } else {
    throw { status: 400, message: "Failed to send email" };
  }
};

export default { createUser };
