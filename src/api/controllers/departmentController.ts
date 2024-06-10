import { Request, Response } from "express";
import prisma from "../../prisma/client";

// Create department
const createDepartment = async (req: Request, res: Response) => {
  try {
    const { name, email, organizationId } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: "User does not exist" });
    }

    // Check if the user type is an owner or admin
    if (user.userType !== "OWNER" && user.userType !== "ADMIN") {
      return res.status(403).json({
        error: "You do not have permission to create a department",
      });
    }

    // Check if the organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      return res.status(404).json({
        error:
          "A department needs to belong to an organization. Please create an organization first!",
      });
    }

    // Create the department
    const department = await prisma.department.create({
      data: {
        name,
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    res.status(201).json({
      message: "Department created successfully",
      department,
    });
  } catch (error) {
    console.error("Error creating department:", error);
    res.status(500).send("Error creating department");
  }
};

export default createDepartment;
