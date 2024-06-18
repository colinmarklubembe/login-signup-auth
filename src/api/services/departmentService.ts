import prisma from "../../prisma/client";

const createDepartment = async (
  name: string,
  description: string,
  organizationId: string,
  email: string
) => {
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw { status: 404, message: "User not found" };
    }

    // Check if the user type is an owner or admin
    if (user.userType !== "OWNER") {
      throw {
        status: 403,
        message: "User is not authorized to create a department",
      };
    }

    // check if user belongs to the organization
    const userOrganization = await prisma.userOrganizationRole.findFirst({
      where: {
        userId: user.id,
        organizationId,
      },
    });

    if (!userOrganization) {
      throw {
        status: 403,
        message: "User does not belong to the organization",
      };
    }

    // Check if the organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw { status: 404, message: "Organization not found" };
    }

    // check if the organization has a department with the same name
    const checkDepartment = await prisma.department.findFirst({
      where: {
        name,
        organizationId,
      },
    });

    if (checkDepartment) {
      throw {
        status: 400,
        message: "Department with the same name already exists",
      };
    }

    const newDepartment = await prisma.department.create({
      data: {
        name,
        description,
        organizationId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });

    // Add the user to the department
    await prisma.userDepartment.create({
      data: {
        userId: user.id,
        departmentId: newDepartment.id,
      },
    });

    return newDepartment;
  } catch (error: any) {
    console.error("Error creating department:", error);
    throw {
      status: error.status || 500,
      message: error.message || "Internal server error",
    };
  }
};

const updateDepartment = async (
  id: string,
  name: string,
  description: string
) => {
  try {
    // Check if the department exists
    const department = await prisma.department.findUnique({
      where: { id },
    });

    if (!department) {
      throw { status: 404, message: "Department not found" };
    }

    const updatedDepartment = await prisma.department.update({
      where: {
        id,
      },
      data: {
        name,
        description,
        updatedAt: new Date().toISOString(),
      },
    });
    return updatedDepartment;
  } catch (error: any) {
    console.error("Error updating department:", error);
    throw {
      status: error.status || 500,
      message: error.message || "Internal server error",
    };
  }
};

const deleteDepartment = async (id: string) => {
  try {
    // Check if the department exists
    const department = await prisma.department.findUnique({
      where: { id },
    });

    if (!department) {
      throw { status: 404, message: "Department not found" };
    }

    return prisma.department.delete({
      where: {
        id,
      },
    });
  } catch (error: any) {
    console.error("Error deleting department:", error);
    throw {
      status: error.status || 500,
      message: error.message || "Internal server error",
    };
  }
};

const getAllDepartments = async () => {
  try {
    return prisma.department.findMany();
  } catch (error: any) {
    console.error("Error getting departments:", error);
    throw {
      status: error.status || 500,
      message: error.message || "Internal server error",
    };
  }
};

const getDepartmentById = async (id: string) => {
  try {
    return prisma.department.findUnique({
      where: { id },
    });
  } catch (error: any) {
    console.error("Error getting department:", error);
    throw {
      status: error.status || 500,
      message: error.message || "Internal server error",
    };
  }
};

const getDepartmentsByOrganization = async (organizationId: string) => {
  try {
    // Check if the organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw { status: 404, message: "Organization not found" };
    }

    return await prisma.department.findMany({
      where: {
        organizationId,
      },
    });
  } catch (error: any) {
    console.error("Error getting departments by organization:", error);
    throw {
      status: error.status || 500,
      message: error.message || "Internal server error",
    };
  }
};

const getUsersInDepartment = async (id: string) => {
  try {
    return prisma.userDepartment.findMany({
      where: {
        departmentId: id,
      },
    });
  } catch (error: any) {
    console.error("Error getting users in department:", error);
    throw {
      status: error.status || 500,
      message: error.message || "Internal server error",
    };
  }
};

export default {
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getAllDepartments,
  getDepartmentById,
  getDepartmentsByOrganization,
  getUsersInDepartment,
};
