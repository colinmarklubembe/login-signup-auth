import prisma from "../../../prisma/client";
import sendEmails from "../../../utils/sendEmails";
import jwt from "jsonwebtoken";

const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw { status: 400, message: "User does not exist" };
  }

  const emailTokenData = {
    id: user.id,
    email: user.email,
    name: user.name,
  };

  const generateEmailToken = jwt.sign(emailTokenData, process.env.JWT_SECRET!);

  // send email with password reset link
  const emailResponse: { status: number } =
    await sendEmails.sendVerificationEmail(generateEmailToken);

  if (emailResponse.status === 200) {
    throw {
      status: 200,
      message: "We sent you and email to reset your password",
    };
  } else {
    throw { status: 400, message: "Failed to send email" };
  }
};

export default { forgotPassword };
