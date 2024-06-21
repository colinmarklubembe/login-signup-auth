import { Request, Response } from "express";
import userService from "../services/userService";

const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // check if user exists
    const user = await userService.findUserById(id);

    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    const userId = user.id;

    const deletedUser = await userService.deleteUserTransaction(userId);

    res.status(200).json({
      message: "User deleted successfully!",
      success: true,
    });
  } catch (error: any) {
    res.json({ message: error.message });
  }
};

export default { deleteUser };
