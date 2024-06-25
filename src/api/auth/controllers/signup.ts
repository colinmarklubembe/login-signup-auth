import { Request, Response } from "express";
import { validatePasswordStrength } from "../../../utils/checkPasswordStrength";
import { UserType } from "@prisma/client";
import userService from "../services/userService";
import { hashPassword } from "../../../utils/hashPassword";
import generateToken from "../../../utils/generateToken";
import sendEmails from "../../../utils/sendEmails";
import systemLog from "../../../utils/systemLog";

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

    const updatedUser = await userService.updateUser(userId, newData);

    const emailData = {
      email: user.email,
      name: user.name,
      token,
    };

    const emailResponse: { status: number; message: any } =
      await sendEmails.sendVerificationEmail(emailData);

    systemLog.returnConsoleLog(emailResponse.message);

    return res.status(200).json({
      message: "User created successfully",
      success: true,
      user: updatedUser,
    });
  } catch (error: any) {
    res.status(500).json(error.message);
  }
};

export default { signup };
