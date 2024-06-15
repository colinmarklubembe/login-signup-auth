"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvitedUser = exports.createUserAndAssignRole = void 0;
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateToken_1 = require("./generateToken");
const hashPassword_1 = require("./hashPassword");
const sendEmails_1 = __importDefault(require("./sendEmails"));
const prisma = new client_1.PrismaClient();
const createUserAndAssignRole = async (name, email, password, userType, res) => {
    try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: "Email already in use" });
        }
        const hashedPassword = await (0, hashPassword_1.hashPassword)(password);
        // Create the user along with user roles in a single transaction
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                userType,
                createdAt: new Date().toISOString(),
            },
        });
        // create token data with timestamp
        const tokenData = {
            id: user.id,
            email: user.email,
            username: user.name,
            createdAt: new Date().toISOString(), // temporarily store the timestamp of the token creation
            userType: user.userType,
        };
        // create token
        const token = (0, generateToken_1.generateToken)(tokenData);
        // store the token in the database
        await prisma.user.update({
            where: { id: user.id },
            data: {
                verificationToken: token,
            },
        });
        const emailTokenData = {
            email: user.email,
            name: user.name,
            token,
        };
        const generateEmailToken = jsonwebtoken_1.default.sign(emailTokenData, process.env.JWT_SECRET);
        // Send verification email
        sendEmails_1.default.sendVerificationEmail(generateEmailToken, res);
    }
    catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
    finally {
        await prisma.$disconnect();
    }
};
exports.createUserAndAssignRole = createUserAndAssignRole;
const createInvitedUser = async (name, email, password, userType, organizationId, userOrganizationRoles, departmentName, res) => {
    try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: "Email already in use" });
        }
        const defaultPassword = password;
        const hashedPassword = await (0, hashPassword_1.hashPassword)(password);
        // Find roles
        const roleEntities = await prisma.role.findMany({
            where: { name: { in: userOrganizationRoles } },
        });
        // Validate roles
        if (roleEntities.length !== userOrganizationRoles.length) {
            return res.status(400).json({ error: "One or more roles are invalid" });
        }
        // get the deparmtnet id with the department name provided
        const department = await prisma.department.findFirst({
            where: { name: departmentName },
        });
        if (!department) {
            return res.status(400).json({ error: "Department not found" });
        }
        // check if the department belongs to the organization
        if (department.organizationId !== organizationId) {
            return res
                .status(400)
                .json({ error: "Department does not belong to the organization" });
        }
        // Create the user along with user roles in a single transaction
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                userType,
                isVerified: true,
                createdAt: new Date().toISOString(),
                userOrganizationRoles: {
                    create: roleEntities.map((role) => ({
                        organization: {
                            connect: { id: organizationId },
                        },
                        role: {
                            connect: { id: role.id },
                        },
                    })),
                },
            },
            include: {
                userOrganizationRoles: {
                    include: {
                        role: true,
                    },
                },
            },
        });
        // add user to Department
        const userDepartment = await prisma.userDepartment.create({
            data: {
                userId: user.id,
                departmentId: department.id,
            },
        });
        const emailTokenData = {
            email: user.email,
            name: user.name,
            password: defaultPassword,
        };
        const generateEmailToken = jsonwebtoken_1.default.sign(emailTokenData, process.env.JWT_SECRET);
        // Send invitation email
        sendEmails_1.default.sendInviteEmail(generateEmailToken, res);
        // return the created user in the json response
        res.status(200).json({
            message: "Invitation email sent successfully!",
            success: true,
            user,
            userDepartment,
        });
    }
    catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
    finally {
        await prisma.$disconnect();
    }
};
exports.createInvitedUser = createInvitedUser;
