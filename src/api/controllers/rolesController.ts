import { Request, Response } from "express";
import rolesService from "../services/rolesService";

const getRoles = async (req: Request, res: Response) => {
  try {
    const roles = await rolesService.getRoles();
    res.status(200).json({ Roles: roles });
  } catch (error: any) {
    console.error("Error getting roles", error);
    res.status(error.status || 500).json({ message: error.message });
  }
};

export default { getRoles };
