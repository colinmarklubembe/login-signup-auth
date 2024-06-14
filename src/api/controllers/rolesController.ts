import { Request, Response } from "express";
import rolesService from "../services/rolesService";

const getRoles = async (req: Request, res: Response) => {
  try {
    const roles = await rolesService.getRoles(res);
    res.status(200).json({ Roles: roles });
  } catch (error) {
    console.error("Error fetching roles", error);
    res.status(500).send("Error fetching roles");
  }
};

export default { getRoles };
