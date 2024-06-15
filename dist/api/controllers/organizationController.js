"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importDefault(require("../../prisma/client"));
const organizationService_1 = __importDefault(require("../services/organizationService"));
const generateToken_1 = require("../../utils/generateToken");
const createOrganization = async (req, res) => {
    try {
        const { name } = req.body;
        const { email } = req.user;
        // check if email exists in the database
        const user = await client_1.default.user.findUnique({
            where: {
                email,
            },
            include: {
                userOrganizationRoles: {
                    include: {
                        role: true, // Ensure roles are included
                    },
                },
            },
        });
        if (!user) {
            return res.status(404).json({ error: "User does not exist" });
        }
        // check if the user type is an owner
        if (user.userType !== "OWNER") {
            return res.status(403).json({
                error: "You do not have permission to create an organization",
            });
        }
        if (!name) {
            return res.status(400).send("Name is required for creating a workspace");
        }
        // check if user already has an organization with the same name
        const organization = await client_1.default.organization.findFirst({
            where: {
                name,
            },
        });
        if (organization) {
            return res.status(400).json({
                error: "You cannot create another organization with the same name",
            });
        }
        const newOrganization = await organizationService_1.default.createOrganization(name);
        // fetch the role id of the owner
        const ownerRole = await client_1.default.role.findFirst({
            where: {
                name: "OWNER",
            },
        });
        if (!ownerRole) {
            return res.status(500).json({ error: "Owner role not found" });
        }
        // create UserOrganizationRole record
        await client_1.default.userOrganizationRole.create({
            data: {
                user: { connect: { id: user.id } },
                organization: { connect: { id: newOrganization.id } },
                role: { connect: { id: ownerRole.id } },
            },
        });
        // get all user organization roles
        const userOrganizationRoles = await client_1.default.userOrganizationRole.findMany({
            where: {
                userId: user.id,
            },
            include: {
                role: true,
            },
        });
        const roles = userOrganizationRoles.map((userOrganizationRole) => userOrganizationRole.role?.name || "Unknown");
        // create a new token of the user with the updated organizationId
        const tokenData = {
            id: user.id,
            email: user.email,
            name: user.name,
            userType: user.userType,
            isVerified: user.isVerified,
            organizationId: newOrganization.id,
            organizations: user.userOrganizationRoles.map((userOrgRole) => ({
                organizationId: userOrgRole.organizationId,
            })),
            roles,
            createdAt: new Date().toISOString(), // Store the token creation date
        };
        // create a new token
        const newToken = (0, generateToken_1.generateToken)(tokenData);
        // Set the token in the Authorization header
        res.setHeader("Authorization", `Bearer ${newToken}`);
        res.status(201).json({
            message: "Organization created successfully",
            success: true,
            token: newToken,
            organization: newOrganization,
        });
    }
    catch (error) {
        console.error("Error creating organization", error);
        res.status(500).send("Error creating organization");
    }
};
//updating organization
const updateOrganization = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        // check if the organization exists in the database
        const organization = await client_1.default.organization.findUnique({
            where: {
                id,
            },
        });
        if (!organization) {
            return res.status(404).json({ error: "Organization does not exist" });
        }
        if (!name) {
            return res.status(400).send("Name is required for updating a workspace");
        }
        const updatedOrganization = await organizationService_1.default.updateOrganization(id, name);
        res.status(200).json(updatedOrganization);
    }
    catch (error) {
        console.error("Error updating organization", error);
        res.status(500).send("Error updating organization");
    }
};
//read by organization by id
const getOrganizationById = async (req, res) => {
    try {
        const { organizationId } = req.user;
        const organization = await client_1.default.organization.findUnique({
            where: {
                organizationId,
            },
        });
        if (!organization) {
            return res.status(404).json({ error: "Organization not found" });
        }
        res.status(200).json(organization);
    }
    catch (error) {
        console.error("Error fetching organization by ID", error);
        res.status(500).send("Error fetching organization by ID");
    }
};
//read all organizations
const getAllOrganizations = async (req, res) => {
    try {
        const organizations = await client_1.default.organization.findMany();
        res.status(200).json(organizations);
    }
    catch (error) {
        console.error("Error fetching all organizations", error);
        res.status(500).send("Error fetching all organizations");
    }
};
// Delete organization
const deleteOrganization = async (req, res) => {
    try {
        const { id } = req.params;
        const { email } = req.user;
        // check if email exists in the database
        const user = await client_1.default.user.findUnique({
            where: {
                email,
            },
        });
        if (!user) {
            return res.status(404).json({ error: "User does not exist" });
        }
        // check if the user type is an owner
        if (user.userType !== "OWNER") {
            return res.status(403).json({
                error: "You do not have permission to delete an organization",
            });
        }
        // Check if the organization exists
        const organization = await client_1.default.organization.findUnique({
            where: {
                id,
            },
        });
        if (!organization) {
            return res.status(404).json({ error: "Organization not found" });
        }
        // Perform deletion
        await client_1.default.organization.delete({
            where: {
                id,
            },
        });
        res.status(200).json({ message: "Organization deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting organization", error);
        res.status(500).send("Error deleting organization");
    }
};
const selectOrganization = async (req, res) => {
    try {
        const { organizationName } = req.body;
        const { email } = req.user;
        // Get the organization ID based on organizationName
        const organization = await client_1.default.organization.findFirst({
            where: {
                name: organizationName,
            },
        });
        if (!organization) {
            return res.status(404).json({ error: "Organization does not exist" });
        }
        const organizationId = organization.id;
        // check if email exists in the database
        const user = await client_1.default.user.findUnique({
            where: {
                email,
            },
            include: {
                userOrganizationRoles: {
                    include: {
                        role: true, // Ensure roles are included
                    },
                },
            },
        });
        if (!user) {
            return res.status(404).json({ error: "User does not exist" });
        }
        // Check if the user belongs to the selected organization
        const userOrganization = user.userOrganizationRoles.find((userOrgRole) => userOrgRole.organizationId === organizationId);
        if (!userOrganization) {
            return res
                .status(403)
                .json({ error: "Access denied to the organization" });
        }
        const roles = user.userOrganizationRoles.map((userOrganizationRole) => userOrganizationRole.role?.name || "Unknown");
        // create a new token of the user with the updated organizationId
        const tokenData = {
            id: user.id,
            email: user.email,
            name: user.name,
            userType: user.userType,
            isVerified: user.isVerified,
            organizationId: organizationId,
            organizations: user.userOrganizationRoles.map((userOrgRole) => ({
                organizationId: userOrgRole.organizationId,
            })),
            roles,
            createdAt: new Date().toISOString(), // Store the token creation date
        };
        // generate new token
        const newToken = (0, generateToken_1.generateToken)(tokenData);
        // Set the token in the Authorization header
        res.setHeader("Authorization", `Bearer ${newToken}`);
        res.status(201).json({
            message: `Organization ${organizationName} selected successfully`,
            success: true,
            token: newToken,
        });
    }
    catch (error) {
        console.error("Error selecting organization:", error);
        res.status(500).send("Error selecting organization");
    }
};
const getUserOrganizations = async (req, res) => {
    try {
        const { email } = req.user;
        const user = await client_1.default.user.findUnique({
            where: {
                email,
            },
            include: {
                userOrganizationRoles: true,
            },
        });
        if (!user) {
            return res.status(404).json({ error: "User does not exist" });
        }
        const organizations = user.userOrganizationRoles.map((userOrgRole) => ({
            organizationId: userOrgRole.organizationId,
        }));
        // check the organization table for the organization name matching the organizationId
        const organizationNames = await Promise.all(organizations.map(async (org) => {
            const organization = await client_1.default.organization.findUnique({
                where: {
                    id: org.organizationId,
                },
            });
            return organization;
        }));
        res.status(200).json(organizationNames);
    }
    catch (error) {
        console.error("Error fetching user organizations", error);
        res.status(500).send("Error fetching user organizations");
    }
};
exports.default = {
    createOrganization,
    updateOrganization,
    getOrganizationById,
    getAllOrganizations,
    deleteOrganization,
    selectOrganization,
    getUserOrganizations,
};
