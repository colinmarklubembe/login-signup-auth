import workspaceService from "../services/workspaceService";
import { Request, Response } from "express";
import { LoginSession } from "../types/types";

const createWorkspace = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    // Access the admin id from the session
    const adminSession = (req.session as LoginSession).admin;

    // Check if admin is logged in
    if (!adminSession || !adminSession.id) {
      return res.status(403).send("Admin is not logged in");
    }

    const adminId = String(adminSession.id);

    if (!name) {
      return res.status(400).send("Name is required for creating a workspace");
    }

    const newWorkspace = await workspaceService.createWorkspace(
      name,
      description,
      adminId
    );

    res.status(201).json(newWorkspace);
  } catch (error) {
    console.error("Error creating workspace", error);
    res.status(500).send("Error creating workspace");
  }
};

export default {
  createWorkspace,
};
