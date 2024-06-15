"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importDefault(require("../../prisma/client"));
const createDepartment = async (name, description, organizationId, res) => {
    try {
        return client_1.default.department.create({
            data: {
                name,
                description,
                organizationId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        });
    }
    catch (error) {
        console.error("Error creating department:", error);
        res.status(500).send("Error creating department");
    }
};
const updateDepartment = async (id, name, res) => {
    try {
        return client_1.default.department.update({
            where: {
                id,
            },
            data: {
                name,
                updatedAt: new Date().toISOString(),
            },
        });
    }
    catch (error) {
        console.error("Error updating department:", error);
        res.status(500).send("Error updating department");
    }
};
const deleteDepartment = async (id, res) => {
    try {
        return client_1.default.department.delete({
            where: {
                id,
            },
        });
    }
    catch (error) {
        console.error("Error deleting department:", error);
        res.status(500).send("Error deleting department");
    }
};
const getAllDepartments = async (res) => {
    try {
        return client_1.default.department.findMany();
    }
    catch (error) {
        console.error("Error getting departments:", error);
        res.status(500).send("Error getting departments");
    }
};
const getDepartmentById = async (id, res) => {
    try {
        return client_1.default.department.findUnique({
            where: { id },
        });
    }
    catch (error) {
        console.error("Error getting department:", error);
        res.status(500).send("Error getting department");
    }
};
const getDepartmentsByOrganization = async (organizationId, res) => { };
exports.default = {
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getAllDepartments,
    getDepartmentById,
};
