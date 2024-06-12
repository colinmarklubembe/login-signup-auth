import { Request, Response } from "express";
import prisma from "../../prisma/client";
import organizationService from "../services/organizationService";

interface AuthenticatedRequest extends Request {
  user?: { email: string };
}

const createOrganization = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name } = req.body;
    const { email } = req.user!;

    // check if email exists in the database
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User does not exist" });
    }

    // check if the user type is an owner
    if (user.userType !== "OWNER") {
      return res.status(403).json({
        error: "You do not have permission to create an organization",
      });
    }

    const userId = user.id;

    if (!name) {
      return res.status(400).send("Name is required for creating a workspace");
    }

    const newOrganization = await organizationService.createOrganization(
      name
      // userId
    );

    // fetch the role id of the owner
    const ownerRole = await prisma.role.findFirst({
      where: {
        name: "OWNER",
      },
    });

    if (!ownerRole) {
      return res.status(500).json({ error: "Owner role not found" });
    }

    // create UserOrganization record
    await prisma.userOrganizationRole.create({
      data: {
        user: { connect: { id: user.id } },
        organization: { connect: { id: newOrganization.id } },
        role: { connect: { id: ownerRole.id } },
      },
    });

    res.status(201).json(newOrganization);
  } catch (error) {
    console.error("Error creating organization", error);
    res.status(500).send("Error creating organization");
  }
};

const updateOrganization = async (req: Request, res: Response) => {
  try {
    const { orgId } = req.params;
    const { name } = req.body;

    // check if the organization exists in the database
    const organization = await prisma.organization.findUnique({
      where: {
        orgId,
      },
    });

    if (!organization) {
      return res.status(404).json({ error: "Organization does not exist" });
    }

    if (!name) {
      return res.status(400).send("Name is required for updating a workspace");
    }

    const updatedOrganization = await organizationService.updateOrganization(
      orgId,
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
