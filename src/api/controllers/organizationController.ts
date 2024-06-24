import { Request, Response } from "express";
import organizationService from "../services/organizationService";
import userService from "../auth/services/userService";
import { UserType } from "@prisma/client";
import departmentService from "../services/departmentService";

interface AuthenticatedRequest extends Request {
  user?: { email: string };
  organization?: { organizationId: string };
}

const createOrganization = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, address, phoneNumber, organizationEmail } = req.body;
    const { email } = req.user!;

    // check if email exists in the database
    const user = await userService.findUserByEmail(email);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // check if user already has an organization with the same name
    const organization = await organizationService.findOrganizationByName(name);

    if (organization) {
      return res
        .status(400)
        .json({ message: "Organization with that name already exists" });
    }

    // create organization
    const data = {
      name,
      address,
      phoneNumber,
      organizationEmail,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newOrganization = await organizationService.createOrganization(data);

    const userId = user.id;
    const organizationId = newOrganization.id;

    // create userOrganization record
    await userService.addUserToOrganization(userId, organizationId);

    // update the user to be an owner of the organization
    const newData = {
      userType: UserType.OWNER,
    };

    await userService.updateUser(userId, newData);

    const updatedUser = await userService.findUserByEmail(email);

    res.status(201).setHeader("organization-id", `${organizationId}`).json({
      message: "Organization created successfully",
      success: true,
      user: updatedUser,
      organization: newOrganization,
    });
  } catch (error: any) {
    res.json({ message: error.message });
  }
};

//updating organization
const updateOrganization = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, address, phoneNumber, organizationEmail } =
      req.body;

    const organizationId = id;

    const organization = await organizationService.findOrganizationById(
      organizationId
    );

    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    const newData = {
      name,
      description,
      address,
      phoneNumber,
      organizationEmail,
      updatedAt: new Date().toISOString(),
    };

    const updatedOrganization = await organizationService.updateOrganization(
      organizationId,
      newData
    );

    res.status(200).json(updatedOrganization);
  } catch (error: any) {
    res.json({ message: error.message });
  }
};

//read by organization by id
const getOrganizationById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { organizationId } = req.organization!;

    const organization = await organizationService.getOrganizationById(
      organizationId
    );

    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    res.status(200).json(organization);
  } catch (error: any) {
    res.json({ message: error.message });
  }
};

//read all organizations
const getAllOrganizations = async (req: Request, res: Response) => {
  try {
    const organizations = organizationService.getAllOrganizations();

    res.status(200).json(organizations);
  } catch (error: any) {
    res.json({ message: error.message });
  }
};

// Delete organization
const deleteOrganization = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { email } = req.user!;

    // check if email exists in the database
    const user = await userService.findUserByEmail(email);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // check if the user type is an owner
    if (user.userType !== "OWNER") {
      return res
        .status(403)
        .json({ error: "User is not authorized to delete this organization" });
    }

    // Check if the organization exists
    const organizationId = id;
    const organization = await organizationService.getOrganizationById(
      organizationId
    );

    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    const userId = user.id;

    // get all departments in the organization
    const departments = await departmentService.getDepartmentsByOrganization(
      organizationId
    );

    // get the department IDs
    const departmentIds = departments.map((department: any) => department.id);

    const response = await organizationService.deleteOrganizationTransaction(
      organizationId,
      departmentIds
    );

    res.status(200).json({
      message: "Organization and all related data deleted successfully",
      response,
    });
  } catch (error: any) {
    console.error("Error deleting organization", error);
    res.json({ message: error.message });
  }
};

const selectOrganization = async (req: Request, res: Response) => {
  try {
    const { organizationName } = req.body;

    // Get the organization ID based on organizationName
    const organization = await organizationService.findOrganizationByName(
      organizationName
    );

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    // Set the token in the Authorization header
    res.setHeader("organization-id", `${organization.id}`);

    res.status(201).json({
      message: `Organization ${organization.name} selected successfully`,
      success: true,
      organization: organization,
    });
  } catch (error: any) {
    res.json({ message: error.message });
  }
};

const getUserOrganizations = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { email } = req.user!;

    const user = await userService.findUserByEmail(email);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const organizations = user.userOrganizations.map((userOrg: any) => ({
      organizationId: userOrg.organizationId,
    }));

    // check the organization table for the organization name matching the organizationId
    const organizationNames = await Promise.all(
      organizations.map(async (org: any) => {
        const organizationId = org.organizationId;
        const organization = await organizationService.getOrganizationById(
          organizationId
        );

        return organization;
      })
    );

    res.status(200).json({
      success: true,
      organizations: organizations,
      organizationNames: organizationNames,
    });
  } catch (error: any) {
    res.json({
      message: error.message,
    });
  }
};

export default {
  createOrganization,
  updateOrganization,
  getOrganizationById,
  getAllOrganizations,
  deleteOrganization,
  selectOrganization,
  getUserOrganizations,
};
