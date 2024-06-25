import { Request, Response } from "express";
import userService from "../../auth/services/userService";

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();

    res.status(200).json(users);
  } catch (error: any) {
    res.json({ message: error.message });
  }
};

const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = id;

    const user = await userService.findUserById(userId);

    if (!user) {
      return res.status(404).json({ error: "User does not exist" });
    }

    res.status(200).json({ success: true, user });
  } catch (error: any) {
    res.json({ message: error.message });
  }
};

export default { getAllUsers, getUserById };
