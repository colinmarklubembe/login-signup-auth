import { responses, systemLog } from "../../utils";
import { Request, Response } from "express";
import { organizationService, departmentService } from "../services";
import userService from "../../api/auth/services/userService";

interface AuthenticatedRequest extends Request {
  user?: { email: string };
  organization?: { organizationId: string };
}

class DepartmentController {
  createDepartment = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { name, description } = req.body;
      const { email } = req.user!;
      const { organizationId } = req.organization!;

      // Check if user exists
      const user = await userService.findUserByEmail(email);

      if (!user) {
        return responses.errorResponse(res, 404, "User not found");
      }

      if (user.userType !== "OWNER") {
        return responses.errorResponse(
          res,
          403,
          "Only owners can create departments"
        );
      }

      const userId = user.id;

      // check if user belongs to the organization
      const userOrganization = await userService.findUserOrganization(
        userId,
        organizationId
      );

      if (!userOrganization) {
        return responses.errorResponse(
          res,
          403,
          "User does not belong to the organization"
        );
      }

      // Check if the organization exists
      const organization = await organizationService.findOrganizationById(
        organizationId
      );

      if (!organization) {
        return responses.errorResponse(res, 404, "Organization not found");
      }

      // check if the organization has a department with the same name
      const checkDepartment =
        await departmentService.findOrganizationDepartment(
          name,
          organizationId
        );

      if (checkDepartment) {
        return responses.errorResponse(
          res,
          409,
          "Department with the same name already exists in the organization"
        );
      }

      const data = {
        name,
        description,
        organizationId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Create the department
      const newDepartment = await departmentService.createDepartment(data);

      const departmentId = newDepartment.id;

      // add the user to the department
      const userDepartment = await userService.addUserToDepartment(
        userId,
        departmentId
      );

      responses.successResponse(res, 201, "Department created successfully", {
        newDepartment: newDepartment,
        userDepartment: userDepartment,
      });
    } catch (error: any) {
      responses.errorResponse(res, 500, error.message);
    }
  };

  updateDepartment = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      const departmentId = id;
      // Check if the department exists
      const department = await departmentService.findDepartmentById(
        departmentId
      );

      if (!department) {
        return responses.errorResponse(res, 404, "Department not found");
      }

      const newData = {
        name,
        description,
        updatedAt: new Date().toISOString(),
      };

      const updatedDepartment = await departmentService.updateDepartment(
        departmentId,
        newData
      );

      responses.successResponse(res, 200, "Updated successfully", {
        updatedDepartment: updatedDepartment,
      });
    } catch (error: any) {
      responses.errorResponse(res, 500, error.message);
    }
  };

  deleteDepartment = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const departmentId = id;

      // Check if the department exists
      const department = await departmentService.findDepartmentById(
        departmentId
      );

      if (!department) {
        return responses.errorResponse(res, 404, "Department not found");
      }

      const deletedDepartment =
        departmentService.deleteDepartmentTransaction(departmentId);

      responses.successResponse(res, 200, "Deleted successfully", {
        deletedDepartment: deletedDepartment,
      });
    } catch (error: any) {
      responses.errorResponse(res, 500, error.message);
    }
  };

  getAllDepartments = async (req: Request, res: Response) => {
    try {
      const departments = await departmentService.getAllDepartments();

      if (!departments) {
        return responses.errorResponse(res, 404, "Departments not found");
      }

      responses.successResponse(res, 200, "Departments found", {
        departments: departments,
      });
    } catch (error: any) {
      responses.errorResponse(res, 500, error.message);
    }
  };

  getDepartmentById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const departmentId = id;

      const department = await departmentService.findDepartmentById(
        departmentId
      );

      if (!department) {
        return responses.errorResponse(res, 404, "Department not found");
      }

      // get users in the department
      const users = await departmentService.getUsersInDepartment(departmentId);

      responses.successResponse(res, 200, "Department found", {
        department: department,
        users: users,
      });
    } catch (error: any) {
      responses.errorResponse(res, 500, error.message);
    }
  };

  getDepartmentsByOrganization = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      const { organizationId } = req.organization!;

      // Check if the organization exists
      const organization = await organizationService.findOrganizationById(
        organizationId
      );

      if (!organization) {
        return responses.errorResponse(res, 404, "Organization not found");
      }

      const departments = await departmentService.getDepartmentsByOrganization(
        organizationId
      );

      if (!departments) {
        return responses.errorResponse(
          res,
          404,
          "No departments found for the organization"
        );
      }

      const data = departments.map((department: any) => department.name);

      systemLog.systemInfo(
        `Departments found for organization: ${organization.name}`,
        data
      );

      responses.successResponse(res, 200, "Departments found", {
        departments: departments,
      });
    } catch (error: any) {
      responses.errorResponse(res, 500, error.message);
    }
  };
}

export default new DepartmentController();
