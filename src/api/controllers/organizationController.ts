import { Request, Response } from "express";
import prisma from "../../prisma/client";
import organizationService from "../services/organizationService";
import { generateToken } from "../../utils/generateToken";

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
      include: {
        userOrganizationRoles: {
          include: {
            role: true, // Ensure roles are included
          },
        },
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

    if (!name) {
      return res.status(400).send("Name is required for creating a workspace");
    }

    const newOrganization = await organizationService.createOrganization(name);

    // fetch the role id of the owner
    const ownerRole = await prisma.role.findFirst({
      where: {
        name: "OWNER",
      },
    });

    if (!ownerRole) {
      return res.status(500).json({ error: "Owner role not found" });
    }

    // create UserOrganizationRole record
    await prisma.userOrganizationRole.create({
      data: {
        user: { connect: { id: user.id } },
        organization: { connect: { id: newOrganization.id } },
        role: { connect: { id: ownerRole.id } },
      },
    });

    // get all user organization roles
    const userOrganizationRoles = await prisma.userOrganizationRole.findMany({
      where: {
        userId: user.id,
      },
      include: {
        role: true,
      },
    });

    // Ensure userOrganizationRoles is always an array
    const roles = userOrganizationRoles.map(
      (userOrganizationRole: any) =>
        userOrganizationRole.role?.name || "Unknown"
    );

    // create a new token of the user with the updated organizationId
    const tokenData = {
      id: user.id,
      email: user.email,
      name: user.name,
      userType: user.userType,
      isVerified: user.isVerified,
      newOrganizationId: newOrganization.id,
      organizations: userOrganizationRoles,
      roles,
      createdAt: new Date().toISOString(), // Store the token creation date
    };

    // create a new token
    const newToken = generateToken(tokenData);

    // Set the token in the Authorization header
    res.setHeader("Authorization", `Bearer ${newToken}`);

    res.status(201).json({
      message: "Organization created successfully",
      success: true,
      token: newToken,
      organization: newOrganization,
    });
  } catch (error) {
    console.error("Error creating organization", error);
    res.status(500).send("Error creating organization");
  }
};

//updating organization
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

//read by organization by id
const getOrganizationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const organization = await prisma.organization.findUnique({
      where: {
        id,
      },
    });

    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    res.status(200).json(organization);
  } catch (error) {
    console.error("Error fetching organization by ID", error);
    res.status(500).send("Error fetching organization by ID");
  }
};

//read all organizations
const getAllOrganizations = async (req: Request, res: Response) => {
  try {
    const organizations = await prisma.organization.findMany();

    res.status(200).json(organizations);
  } catch (error) {
    console.error("Error fetching all organizations", error);
    res.status(500).send("Error fetching all organizations");
  }
};

// Delete organization
const deleteOrganization = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
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
        error: "You do not have permission to delete an organization",
      });
    }

    // Check if the organization exists
    const organization = await prisma.organization.findUnique({
      where: {
        id,
      },
    });

    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    // Perform deletion
    await prisma.organization.delete({
      where: {
        id,
      },
    });

    res.status(200).json({ message: "Organization deleted successfully" });
  } catch (error) {
    console.error("Error deleting organization", error);
    res.status(500).send("Error deleting organization");
  }
};

export default {
  createOrganization,
  updateOrganization,
  getOrganizationById,
  getAllOrganizations,
  deleteOrganization,
};
