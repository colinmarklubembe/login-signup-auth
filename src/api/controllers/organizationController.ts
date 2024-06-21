import { Request, Response } from "express";
import organizationService from "../services/organizationService";

interface AuthenticatedRequest extends Request {
  user?: { email: string; organizationId: string };
}

const createOrganization = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, address, phoneNumber, organizationEmail } =
      req.body;
    const { email } = req.user!;

    const response = await organizationService.createOrganization(
      name,
      description,
      address,
      phoneNumber,
      organizationEmail,
      email
    );

    // Set the token in the Authorization header
    res.setHeader("Authorization", `Bearer ${response.newToken}`);

    res.status(201).json({
      message: "Organization created successfully",
      success: true,
      user: response.tokenData,
      token: response.newToken,
      organization: response.newOrganization,
    });
  } catch (error: any) {
    console.error("Error creating organization", error);
    res
      .status(error.status || 500)
      .json({ message: error.message || "Error creating organization" });
  }
};

//updating organization
const updateOrganization = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, address, phoneNumber, organizationEmail } =
      req.body;

    const updatedOrganization = await organizationService.updateOrganization(
      id,
      name,
      description,
      address,
      phoneNumber,
      organizationEmail
    );
    res.status(200).json(updatedOrganization);
  } catch (error: any) {
    console.error("Error updating organization", error);
    res
      .status(error.status || 500)
      .json({ message: error.message || "Error updating organization" });
  }
};

//read by organization by id
const getOrganizationById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { organizationId } = req.user!;

    const organization = await organizationService.getOrganizationById(
      organizationId
    );

    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    res.status(200).json(organization);
  } catch (error: any) {
    console.error("Error fetching organization by id", error);
    res
      .status(error.status || 500)
      .json({ message: error.message || "Error fetching organization by id" });
  }
};

//read all organizations
const getAllOrganizations = async (req: Request, res: Response) => {
  try {
    const organizations = organizationService.getAllOrganizations();

    res.status(200).json(organizations);
  } catch (error: any) {
    console.error("Error fetching organizations", error);
    res
      .status(error.status || 500)
      .json({ message: error.message || "Error fetching organizations" });
  }
};

// Delete organization
const deleteOrganization = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { email } = req.user!;

    const response = await organizationService.deleteOrganization(id, email);

    res
      .status(200)
      .json({ message: "Organization deleted successfully", response });
  } catch (error: any) {
    console.error("Error deleting organization", error);
    res
      .status(error.status || 500)
      .json({ message: error.message || "Error deleting organization" });
  }
};

const selectOrganization = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { organizationName } = req.body;
    const { email } = req.user!;

    const response = await organizationService.selectOrganization(
      organizationName,
      email
    );

    // Set the token in the Authorization header
    res.setHeader("Authorization", `Bearer ${response.newToken}`);

    res.status(201).json({
      message: `Organization ${organizationName} selected successfully`,
      success: true,
      token: response.newToken,
    });
  } catch (error: any) {
    console.error("Error selecting organization", error);
    res
      .status(error.status || 500)
      .json({ message: error.message || "Error selecting organization" });
  }
};

const getUserOrganizations = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { email } = req.user!;

    const userOrganizations = await organizationService.getUserOrganizations(
      email
    );

    res.status(200).json(userOrganizations);
  } catch (error: any) {
    console.error("Error fetching user organizations", error);
    res.status(error.status || 500).json({
      message: error.message || "Error fetching user organizations",
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
