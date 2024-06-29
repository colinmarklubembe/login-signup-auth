import { Request, Response } from "express";
import { sendEmails } from "../../../utils";
import jwt from "jsonwebtoken";
import userService from "../services/userService";
import generateToken from "../../../utils/generateToken";

const verifyUser = async (req: Request, res: Response) => {
  try {
    const token = req.query.token as string;

    if (!token) {
      return res.status(400).json({ message: "Token not found" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
      username: string;
      createdAt: string;
      userType: any;
    };

    const userId = decoded.id;

    // check if a token exists in the database
    const checkUser = await userService.findUserById(userId);

    // check if both tokens match
    if (checkUser?.verificationToken !== token) {
      // return res.status(404).json({ message: "Invalid token" });
    }

    // check if token has expired
    const tokenAge = Date.now() - new Date(decoded.createdAt).getTime();

    if (tokenAge > 3600000) {
      // return res.status(404).json({ message: "Token has expired" });
    }

    const newData = {
      isVerified: true,
      verificationToken: null,
      isActivated: true,
      updatedAt: new Date().toISOString(),
    };

    const user = await userService.updateUser(userId, newData);

    res.status(200).redirect("http://localhost:3000/verifiedEmail");
  } catch (error: any) {
    res.json({ message: error.message });
  }
};

const reverifyUser = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await userService.findUserByEmail(email);

    if (!user) {
      // return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      // return res.status(400).json({ message: "User is already verified" });
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
    const token = generateToken.generateToken(tokenData);

    const userId = user.id;

    const newData = {
      verificationToken: token,
      updatedAt: new Date().toISOString(),
    };

    // update the token in the database
    await userService.updateUser(userId, newData);

    const emailTokenData = {
      email: user.email,
      name: user.name,
      token,
    };

    const generateEmailToken = jwt.sign(
      emailTokenData,
      process.env.JWT_SECRET!
    );

    // send email
    const emailResponse: { status: number } =
      await sendEmails.sendVerificationEmail(generateEmailToken);

    if (emailResponse.status === 200) {
      return res.status(200).json({ message: "Email sent" });
    } else {
      return res.status(500).json({ message: "Email not sent" });
    }
  } catch (error: any) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

export default { verifyUser, reverifyUser };
