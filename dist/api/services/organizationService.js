"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importDefault(require("../../prisma/client"));
const createOrganization = async (name) => {
    return client_1.default.organization.create({
        data: {
            name,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
    });
};
const updateOrganization = async (id, name) => {
    return client_1.default.organization.update({
        where: {
            id,
        },
        data: {
            name,
            updatedAt: new Date().toISOString(),
        },
    });
};
const getOrganizationById = async (id) => {
    return client_1.default.organization.findUnique({
        where: {
            id,
        },
    });
};
const getAllOrganizations = async () => {
    return client_1.default.organization.findMany();
};
const deleteOrganization = async (id) => {
    return client_1.default.organization.delete({
        where: {
            id,
        },
    });
};
exports.default = {
    createOrganization,
    updateOrganization,
    getOrganizationById,
    getAllOrganizations,
    deleteOrganization,
};
