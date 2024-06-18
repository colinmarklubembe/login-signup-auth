import { generateToken } from "./../../../utils/generateToken";
import prisma from "../../../prisma/client";
import jwt from "jsonwebtoken";
import sendEmails from "../../../utils/sendEmails";

const verifyUser = async (token: string) => {
  if (!token) {
    throw { status: 400, message: "Invalid token" };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
      username: string;
      createdAt: string;
      userType: any;
    };

    // check if a token exists in the database
    const checkUser = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { verificationToken: true },
    });

    // check if both tokens match
    if (checkUser?.verificationToken !== token) {
      throw { status: 400, message: "Invalid token" };
    }

    // check if token has expired
    const tokenAge = Date.now() - new Date(decoded.createdAt).getTime();

    if (tokenAge > 3600000) {
      throw { status: 400, message: "Token has expired" };
    }

    const user = await prisma.user.update({
      where: { id: decoded.id },
      data: {
        isVerified: true,
        verificationToken: null,
        isActivated: true,
        updatedAt: new Date().toISOString(),
      },
    });
    return { status: 200, message: "Email verified successfully" };
  } catch (error) {
    console.error("Error verifying user account: ", error);
    throw { status: 400, message: "Error verifying user account" };
  }
};

const reverifyUser = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw { status: 400, message: "User not found" };
  }

  if (user.isVerified) {
    throw { status: 400, message: "User is already verified" };
  }

  // create token data with timestamp
  const tokenData = {
    id: user.id,
    email: user.email,
    username: user.name,
    createdAt: user.createdAt,
    userType: user.userType,
  };

  // Create token
  const token = generateToken(tokenData);

  // update the token in the database
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
    return { status: 200, message: "Email sent" };
  } else {
    throw { status: 400, message: "Failed to send email" };
  }
};

export default { verifyUser, reverifyUser };
