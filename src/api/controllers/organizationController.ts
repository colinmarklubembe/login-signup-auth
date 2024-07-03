import { UserType } from "@prisma/client";
import { Request, Response } from "express";
import { responses } from "../../utils";
import { organizationService, departmentService } from "../services";
import userService from "../auth/services/userService";

interface AuthenticatedRequest extends Request {
  user?: { email: string };
  organization?: { organizationId: string };
}

class OrganizationController {
  createOrganization = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { name, address, phoneNumber, organizationEmail } = req.body;
      const { email } = req.user!;

      // check if email exists in the database
      const user = await userService.findUserByEmail(email);

      if (!user) {
        return responses.errorResponse(res, 404, "User not found");
      }

      // check if user already has an organization with the same name
      const organizationName = name.trim().toLowerCase();
      const organization = await organizationService.findOrganizationByName(
        organizationName
      );

      if (organization) {
        return responses.errorResponse(
          res,
          400,
          "Organization name already exists"
        );
      }

      // check if organization email already exists
      const orgEmail = await organizationService.findOrganizationEmail(
        organizationEmail
      );

      if (orgEmail) {
        return responses.errorResponse(
          res,
          400,
          "Organization with this email already exists"
        );
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

      const newOrganization = await organizationService.createOrganization(
        data
      );

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

      responses.successResponse(res, 201, "Organization created successfully", {
        newOrganization: newOrganization,
        updatedUser: updatedUser,
      });
    } catch (error: any) {
      responses.errorResponse(res, 500, error.message);
    }
  };

  //updating organization
  updateOrganization = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, description, address, phoneNumber, organizationEmail } =
        req.body;

      const organizationId = id;

      const organization = await organizationService.findOrganizationById(
        organizationId
      );

      if (!organization) {
        return responses.errorResponse(res, 404, "Organization not found");
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

      responses.successResponse(res, 200, "Organization updated successfully", {
        updatedOrganization: updatedOrganization,
      });
    } catch (error: any) {
      responses.errorResponse(res, 500, error.message);
    }
  };

  //read by organization by id
  getOrganizationById = async (req: Request, res: Response) => {
    try {
      const { organizationId } = req.params;

      const organization = await organizationService.getOrganizationById(
        organizationId
      );

      if (!organization) {
        return responses.errorResponse(res, 404, "Organization not found");
      }

      responses.successResponse(
        res,
        200,
        `Organization ${organization.name} found`,
        {
          organization: organization,
        }
      );
    } catch (error: any) {
      responses.errorResponse(res, 500, error.message);
    }
  };

  getUserOrgnaizationById = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      const { email } = req.user!;
      const { organizationId } = req.organization!;

      const user = await userService.findUserByEmail(email);

      if (!user) {
        return responses.errorResponse(res, 404, "User not found");
      }

      // check if user is part of the organization
      const userOrganization = user.userOrganizations.find(
        (org: any) => org.organizationId === organizationId
      );

      if (!userOrganization) {
        return responses.errorResponse(
          res,
          403,
          "User is not part of this organization"
        );
      }

      const organization = await organizationService.getOrganizationById(
        organizationId
      );

      responses.successResponse(
        res,
        200,
        `Organization ${organization.name} found`,
        {
          organization: organization,
        }
      );
    } catch (error: any) {
      responses.errorResponse(res, 500, error.message);
    }
  };

  //read all organizations
  getAllOrganizations = async (req: Request, res: Response) => {
    try {
      const organizations = organizationService.getAllOrganizations();

      if (!organizations) {
        return responses.errorResponse(res, 404, "No organizations found");
      }

      responses.successResponse(res, 200, "Organizations found", {
        organizations: organizations,
      });
    } catch (error: any) {
      responses.errorResponse(res, 500, error.message);
    }
  };

  // Delete organization
  deleteOrganization = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { email } = req.user!;

      // check if email exists in the database
      const user = await userService.findUserByEmail(email);

      if (!user) {
        return responses.errorResponse(res, 404, "User not found");
      }

      // check if the user type is an owner
      if (user.userType !== "OWNER") {
        return responses.errorResponse(
          res,
          403,
          "Unauthorized! Only the organization owner can delete this organization"
        );
      }

      // Check if the organization exists
      const organizationId = id;
      const organization = await organizationService.getOrganizationById(
        organizationId
      );

      if (!organization) {
        return responses.errorResponse(res, 404, "Organization not found");
      }

      const userId = user.id;

      // get all departments in the organization
      const departments = await departmentService.getDepartmentsByOrganization(
        organizationId
      );

      // get the department IDs
      const departmentIds = departments.map((department: any) => department.id);

      const deletedOrganization =
        await organizationService.deleteOrganizationTransaction(
          organizationId,
          departmentIds
        );

      responses.successResponse(res, 200, "Organization deleted successfully", {
        deletedOrganization: deletedOrganization,
      });
    } catch (error: any) {
      responses.errorResponse(res, 500, error.message);
    }
  };

  selectOrganization = async (req: Request, res: Response) => {
    try {
      const { organizationName } = req.body;

      // Get the organization ID based on organizationName
      const organization = await organizationService.findOrganizationByName(
        organizationName
      );

      if (!organization) {
        return responses.errorResponse(res, 404, "Organization not found");
      }

      // Set the token in the Authorization header
      res.setHeader("organization-id", `${organization.id}`);

      responses.successResponse(
        res,
        200,
        `Organization ${organization.name} selected successfully`,
        {
          organization: organization,
        }
      );
    } catch (error: any) {
      responses.errorResponse(res, 500, error.message);
    }
  };

  getUserOrganizations = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { email } = req.user!;

      const user = await userService.findUserByEmail(email);

      if (!user) {
        return responses.errorResponse(res, 404, "User not found");
      }

      const organizations = user.userOrganizations.map((userOrg: any) => ({
        organizationId: userOrg.organizationId,
      }));

      // check the organization table for the organization name matching the organizationId
      const returnedOrganizations = await Promise.all(
        organizations.map(async (org: any) => {
          const organizationId = org.organizationId;
          const organization = await organizationService.getOrganizationById(
            organizationId
          );

          return organization;
        })
      );

      responses.successResponse(res, 200, "User organizations found", {
        organizations: returnedOrganizations,
      });
    } catch (error: any) {
      responses.errorResponse(res, 500, error.message);
    }
  };
}

export default new OrganizationController();
