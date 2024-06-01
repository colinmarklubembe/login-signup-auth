import workspaceService from "../services/workspaceService";
import { Request, Response } from "express";

const createWorkspace = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).send("Name is required for creating a workspace");
    }

    const newWorkspace = await workspaceService.createWorkspace(
      name,
      description
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
