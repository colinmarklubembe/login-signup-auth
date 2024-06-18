import { Request, Response } from "express";
import updateProfileService from "../services/updateProfile";

const updateProfile = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email } = req.body;

  try {
    await updateProfileService.updateProfile(name, email, id);
    res.status(200).json({
      message: "Profile updated successfully!",
      success: true,
    });
  } catch (error: any) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

export default { updateProfile };
