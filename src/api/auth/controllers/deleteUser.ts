import { Request, Response } from "express";
import deleteUserService from "../services/deleteUser";

const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await deleteUserService.deleteUser(id);
    res.status(200).json({
      message: "User deleted successfully!",
      success: true,
    });
  } catch (error: any) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

export default { deleteUser };
