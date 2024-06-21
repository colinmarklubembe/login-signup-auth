import { Request, Response } from "express";
import { validatePasswordStrength } from "../../../utils/checkPasswordStrength";
import { UserType } from "@prisma/client";
import userService from "../services/userService";
import { hashPassword } from "../../../utils/hashPassword";
import generateToken from "../../../utils/generateToken";
import sendEmails from "../../../utils/sendEmails";

const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    validatePasswordStrength(password);

    const checkUser = await userService.findUserByEmail(email);

    if (checkUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await hashPassword(password);

    // Create the user data
    const data = {
      name,
      email,
      password: hashedPassword,
      userType: UserType.USER,
      createdAt: new Date().toISOString(),
    };

    const user = await userService.createUser(data);

    // create token data with timestamp
    const tokenData = {
      id: user.id,
      email: user.email,
      username: user.name,
      createdAt: new Date().toISOString(), // temporarily store the timestamp of the token creation
      userType: user.userType,
    };

    const token = generateToken.generateToken(tokenData);

    const userId = user.id;
    const newData = {
      verificationToken: token,
    };

    await userService.updateUser(userId, newData);

    const emailTokenData = {
      email: user.email,
      name: user.name,
      token,
    };

    const generateEmailToken = generateToken.generateToken(emailTokenData);

    const emailResponse: { status: number } =
      await sendEmails.sendVerificationEmail(generateEmailToken);

    if (emailResponse.status === 200) {
      return res.status(200).json({
        message:
          "Verification email sent successfully! Please verify your email",
      });
    } else {
      return res.status(400).json({ message: "Failed to send email!" });
    }
  } catch (error: any) {
    res.json(error.message);
  }
};

export default { signup };
