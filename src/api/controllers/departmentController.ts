import { Request, Response } from "express";
import prisma from "../../prisma/client";
import departmentService from "../services/departmentService";

interface AuthenticatedRequest extends Request {
  user?: { email: string; organizationId: string };
}

const createDepartment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    const { email, organizationId } = req.user!;

    // Create the department
    const newDepartment = await departmentService.createDepartment(
      name,
      description,
      organizationId,
      email
    );

    res.status(201).json({ message: "Department created", newDepartment });
  } catch (error: any) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

const updateDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const updatedDepartment = await departmentService.updateDepartment(
      id,
      name
    );

    res.status(200).json(updatedDepartment);
  } catch (error: any) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedDepartment = departmentService.deleteDepartment(id);
    res.status(200).json(deletedDepartment);
  } catch (error: any) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

const getAllDepartments = async (req: Request, res: Response) => {
  try {
    const departments = await departmentService.getAllDepartments();
    res.status(200).json(departments);
  } catch (error: any) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

const getDepartmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const department = await departmentService.getDepartmentById(id);

    if (!department) {
      return res.status(404).json({ error: "Department does not exist" });
    }

    // get users in the department
    const users = await departmentService.getUsersInDepartment(id);

    res.status(200).json({ department, users });
  } catch (error: any) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

const getDepartmentsByOrganization = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { organizationId } = req.user!;

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
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
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
