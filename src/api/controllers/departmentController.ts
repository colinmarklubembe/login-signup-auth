import { Request, Response } from "express";
import departmentService from "../services/departmentService";
import userService from "../../api/auth/services/userService";
import organizationService from "../services/organizationService";

interface AuthenticatedRequest extends Request {
  user?: { email: string };
  organization?: { organizationId: string };
}

const createDepartment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    const { email } = req.user!;
    const { organizationId } = req.organization!;

    // Check if user exists
    const user = await userService.findUserByEmail(email);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.userType !== "OWNER") {
      return res
        .status(403)
        .json({ message: " User is not authorized to create a department" });
    }

    const userId = user.id;

    // check if user belongs to the organization
    const userOrganization = await userService.findUserOrganization(
      userId,
      organizationId
    );

    if (!userOrganization) {
      return res
        .status(403)
        .json({ message: "User does not belong to the Organization" });
    }

    // Check if the organization exists
    const organization = await organizationService.findOrganizationById(
      organizationId
    );

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    // check if the organization has a department with the same name
    const checkDepartment = await departmentService.findOrganizationDepartment(
      name,
      organizationId
    );

    if (checkDepartment) {
      return res
        .status(409)
        .json({ message: "Department with the same name already exists" });
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

    res.status(201).json({ message: "Department created", newDepartment });
  } catch (error: any) {
    res.json({ message: error.message });
  }
};

const updateDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const departmentId = id;
    // Check if the department exists
    const department = await departmentService.findDepartmentById(departmentId);

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
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

    res
      .status(200)
      .json({ message: "Department updated Successfully!", updatedDepartment });
  } catch (error: any) {
    res.json({ message: error.message });
  }
};

const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const departmentId = id;

    // Check if the department exists
    const department = await departmentService.findDepartmentById(departmentId);

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const deletedDepartment =
      departmentService.deleteDepartmentTransaction(departmentId);

    res
      .status(200)
      .json({ message: "Deleted successfully", deletedDepartment });
  } catch (error: any) {
    res.json({ message: error.message });
  }
};

const getAllDepartments = async (req: Request, res: Response) => {
  try {
    const departments = await departmentService.getAllDepartments();

    res.status(200).json(departments);
  } catch (error: any) {
    res.json({ message: error.message });
  }
};

const getDepartmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const departmentId = id;

    const department = await departmentService.findDepartmentById(departmentId);

    if (!department) {
      return res.status(404).json({ error: "Department does not exist" });
    }

    // get users in the department
    const users = await departmentService.getUsersInDepartment(departmentId);

    res
      .status(200)
      .json({ success: true, department: department, users: users });
  } catch (error: any) {
    res.json({ message: error.message });
  }
};

const getDepartmentsByOrganization = async (
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
      return res.status(404).json({ message: "Organization not found" });
    }

    const departments = await departmentService.getDepartmentsByOrganization(
      organizationId
    );

    if (!departments) {
      return res
        .status(404)
        .json({ error: "Departments do not exist in this organization" });
    }

    console.log(
      "Departments' names:",
      departments.map((department: any) => department.name)
    );
    res.status(200).json(departments);
  } catch (error: any) {
    res.json({ message: error.message });
  }
};

export default {
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getAllDepartments,
  getDepartmentById,
  getDepartmentsByOrganization,
};
