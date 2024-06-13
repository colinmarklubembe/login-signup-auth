import prisma from "../../prisma/client";
import { Response } from "express";

const createDepartment = async (
  name: string,
  description: string,
  organizationId: string,
  res: Response
) => {
  try {
    return prisma.department.create({
      data: {
        name,
        description,
        organizationId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error creating department:", error);
    res.status(500).send("Error creating department");
  }
};

const updateDepartment = async (id: string, name: string, res: Response) => {
  try {
    return prisma.department.update({
      where: {
        id,
      },
      data: {
        name,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating department:", error);
    res.status(500).send("Error updating department");
  }
};

const deleteDepartment = async (id: string, res: Response) => {
  try {
    return prisma.department.delete({
      where: {
        id,
      },
    });
  } catch (error) {
    console.error("Error deleting department:", error);
    res.status(500).send("Error deleting department");
  }
};

const getAllDepartments = async (res: Response) => {
  try {
    return prisma.department.findMany();
  } catch (error) {
    console.error("Error getting departments:", error);
    res.status(500).send("Error getting departments");
  }
};

const getDepartmentById = async (id: string, res: Response) => {
  try {
    return prisma.department.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error("Error getting department:", error);
    res.status(500).send("Error getting department");
  }
};

const getDepartmentsByOrganization = async (
  organizationId: string,
  res: Response
) => {};

export default {
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getAllDepartments,
  getDepartmentById,
};
