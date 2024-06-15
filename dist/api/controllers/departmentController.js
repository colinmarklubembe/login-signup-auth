"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importDefault(require("../../prisma/client"));
const departmentService_1 = __importDefault(require("../services/departmentService"));
// Create department
const createDepartment = async (req, res) => {
    try {
        const { name, description } = req.body;
        const { email, organizationId } = req.user;
        // Check if user exists
        const user = await client_1.default.user.findUnique({
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
        // check if user belongs to the organization
        const userOrganization = await client_1.default.userOrganizationRole.findFirst({
            where: {
                userId: user.id,
                organizationId,
            },
        });
        if (!userOrganization) {
            return res.status(404).json({
                error: "User does not belong to the organization",
            });
        }
        // Check if the organization exists
        const organization = await client_1.default.organization.findUnique({
            where: { id: organizationId },
        });
        if (!organization) {
            return res.status(404).json({
                error: "A department needs to belong to an organization. Please create an organization first!",
            });
        }
        // check if the organization has a department with the same name
        const checkDepartment = await client_1.default.department.findFirst({
            where: {
                name,
                organizationId,
            },
        });
        if (checkDepartment) {
            return res.status(400).json({
                error: "A department with the same name already exists in this organization",
            });
        }
        // Create the department
        const newDepartment = await departmentService_1.default.createDepartment(name, description, organizationId, res);
        // Add the user to the department
        await client_1.default.userDepartment.create({
            data: {
                userId: user.id,
                departmentId: newDepartment.id,
            },
        });
        res.status(201).json({ message: "Department created", newDepartment });
    }
    catch (error) {
        console.error("Error creating department:", error);
        res.status(500).send("Error creating department");
    }
};
const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        // Check if the department exists
        const department = await client_1.default.department.findUnique({
            where: { id },
        });
        if (!department) {
            return res.status(404).json({ error: "Department does not exist" });
        }
        if (!name) {
            return res.status(400).send("Name is required for updating a department");
        }
        const updatedDepartment = departmentService_1.default.updateDepartment(id, name, res);
        res.status(200).json(updatedDepartment);
    }
    catch (error) {
        console.error("Error updating department:", error);
        res.status(500).send("Error updating department");
    }
};
const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        // Check if the department exists
        const department = await client_1.default.department.findUnique({
            where: { id },
        });
        if (!department) {
            return res.status(404).json({ error: "Department does not exist" });
        }
        const deletedDepartment = departmentService_1.default.deleteDepartment(id, res);
        res.status(200).json(deletedDepartment);
    }
    catch (error) {
        console.error("Error deleting department:", error);
        res.status(500).send("Error deleting department");
    }
};
const getAllDepartments = async (req, res) => {
    try {
        const departments = await departmentService_1.default.getAllDepartments(res);
        res.status(200).json(departments);
    }
    catch (error) {
        console.error("Error getting departments:", error);
        res.status(500).send("Error getting departments");
    }
};
const getDepartmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const department = await departmentService_1.default.getDepartmentById(id, res);
        if (!department) {
            return res.status(404).json({ error: "Department does not exist" });
        }
        // get users in the department
        const users = await client_1.default.userDepartment.findMany({
            where: {
                departmentId: id,
            },
        });
        res.status(200).json({ department, users });
    }
    catch (error) {
        console.error("Error getting department:", error);
        res.status(500).send("Error getting department");
    }
};
const getDepartmentsByOrganization = async (req, res) => {
    try {
        const { organizationId } = req.user;
        // Check if the organization exists
        const organization = await client_1.default.organization.findUnique({
            where: { id: organizationId },
        });
        if (!organization) {
            return res.status(404).json({ error: "Organization does not exist" });
        }
        const departments = await client_1.default.department.findMany({
            where: {
                organizationId,
            },
        });
        if (!departments) {
            return res.status(404).json({ error: "Departments do not exist" });
        }
        console.log("Departments' names:", departments.map((department) => department.name));
        res.status(200).json(departments);
    }
    catch (error) {
        console.error("Error getting departments:", error);
        res.status(500).send("Error getting departments");
    }
};
exports.default = {
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getAllDepartments,
    getDepartmentById,
    getDepartmentsByOrganization,
};
