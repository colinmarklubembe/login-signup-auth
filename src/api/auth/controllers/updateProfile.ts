import { Request, Response } from "express";
import generateToken from "../../../utils/generateToken";
import sendEmails from "../../../utils/sendEmails";
import userService from "../services/userService";

const updateProfile = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email } = req.body;

  try {
    const user = await userService.findUserById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userId = user.id;

    const newData = {
      name,
      email,
      updatedAt: new Date().toISOString(),
    };

    const updatedUser = await userService.updateUser(userId, newData);

    // send update profile email to user
    const emailData = {
      email: user.email,
      name: user.name,
    };

    // Send invitation email
    const response = await sendEmails.sendUpdatedProfileEmail(emailData);

    if (response.status === 200) {
      return res.status(200).json({
        message: "Profile updated successfully!",
        success: true,
        user: updatedUser,
      });
    }
  } catch (error: any) {
    res.json({ message: error.message });
  }
};

export default { updateProfile };
