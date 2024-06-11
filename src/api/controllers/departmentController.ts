import { Request, Response } from "express";
import prisma from "../../prisma/client";
import departmentService from "../services/departmentService";

interface AuthenticatedRequest extends Request {
  user?: { email: string; orgId: string };
}

// Create department
const createDepartment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name } = req.body;
    const { email, orgId } = req.user!;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: "User does not exist" });
    }

    // check if user belongs to the organization
    const userOrganization = await prisma.organization.findUnique({
      where: { userId: user.id },
    });

    // Check if the user type is an owner or admin
    if (user.userType !== "OWNER" && user.userType !== "ADMIN") {
      return res.status(403).json({
        error: "You do not have permission to create a department",
      });
    }

    if (!userOrganization) {
      return res.status(404).json({
        error: "User does not belong to the organization",
      });
    }

    // Check if the organization exists
    const organization = await prisma.organization.findUnique({
      where: { orgId },
    });

    if (!organization) {
      return res.status(404).json({
        error:
          "A department needs to belong to an organization. Please create an organization first!",
      });
    }

    // attach the organizationId to the department
    const organizationId = organization.orgId;

    // Create the department
    const newDepartment = departmentService.createDepartment(
      name,
      organizationId,
      res
    );
    res.status(201).json(newDepartment);
  } catch (error) {
    console.error("Error creating department:", error);
    res.status(500).send("Error creating department");
  }
};

const updateDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // Check if the department exists
    const department = await prisma.department.findUnique({
      where: { id },
    });

    if (!department) {
      return res.status(404).json({ error: "Department does not exist" });
    }

    if (!name) {
      return res.status(400).send("Name is required for updating a department");
    }

    const updatedDepartment = departmentService.updateDepartment(id, name, res);

    res.status(200).json(updatedDepartment);
  } catch (error) {
    console.error("Error updating department:", error);
    res.status(500).send("Error updating department");
  }
};

const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if the department exists
    const department = await prisma.department.findUnique({
      where: { id },
    });

    if (!department) {
      return res.status(404).json({ error: "Department does not exist" });
    }

    const deletedDepartment = departmentService.deleteDepartment(id, res);
    res.status(200).json(deletedDepartment);
  } catch (error) {
    console.error("Error deleting department:", error);
    res.status(500).send("Error deleting department");
  }
};

const getAllDepartments = async (req: Request, res: Response) => {
  try {
    const departments = await departmentService.getAllDepartments(res);
    res.status(200).json(departments);
  } catch (error) {
    console.error("Error getting departments:", error);
    res.status(500).send("Error getting departments");
  }
};

const getDepartmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const department = await departmentService.getDepartmentById(id, res);

    if (!department) {
      return res.status(404).json({ error: "Department does not exist" });
    }

    res.status(200).json(department);
  } catch (error) {
    console.error("Error getting department:", error);
    res.status(500).send("Error getting department");
  }
};

export default {
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getAllDepartments,
  getDepartmentById,
};
