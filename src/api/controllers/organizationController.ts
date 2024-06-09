// import workspaceService from "../services/organizationService";
import { Request, Response } from "express";
import prisma from "../../prisma/client";
import organizationService from "../services/organizationService";
// import { LoginSession } from "../types/types";

const createOrganization = async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;

    // check if email exists in the database
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User does not exist" });
    }

    // check if the user type is an owner or admin
    if (user.userType !== "OWNER" && user.userType !== "ADMIN") {
      return res.status(403).json({
        error: "You do not have permission to create an organization",
      });
    }

    const userId = user.id;

    if (!name) {
      return res.status(400).send("Name is required for creating a workspace");
    }

    const newOrganization = await organizationService.createOrganization(
      name,
      userId
    );

    res.status(201).json(newOrganization);
  } catch (error) {
    console.error("Error creating organization", error);
    res.status(500).send("Error creating organization");
  }
};

const updateOrganization = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // check if the organization exists in the database
    const organization = await prisma.organization.findUnique({
      where: {
        id,
      },
    });

    if (!organization) {
      return res.status(404).json({ error: "Organization does not exist" });
    }

    if (!name) {
      return res.status(400).send("Name is required for updating a workspace");
    }

    const updatedOrganization = await organizationService.updateOrganization(
      id,
      name
    );
    console.log(updatedOrganization);
    res.status(200).json(updatedOrganization);
  } catch (error) {
    console.error("Error updating organization", error);
    res.status(500).send("Error updating organization");
  }
};

export default {
  createOrganization,
  updateOrganization,
};
