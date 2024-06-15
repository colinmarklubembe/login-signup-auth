"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const client_1 = __importDefault(require("../../prisma/client"));
const comparePassword_1 = require("../../utils/comparePassword");
const generateToken_1 = require("../../utils/generateToken");
const router = (0, express_1.Router)();
// Rate limiter middleware
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    message: "Too many login attempts, please try again after 15 minutes",
});
// Login route with rate limiter applied
router.post("/login", limiter, async (req, res) => {
    const { email, password } = req.body;
    try {
        // Check if user exists
        const user = await client_1.default.user.findUnique({
            where: { email },
            include: {
                userOrganizationRoles: {
                    include: {
                        role: true,
                    },
                },
            },
        });
        if (!user) {
            return res.status(400).json({ error: "Invalid credentials" });
        }
        // Check if user is verified
        if (!user.isVerified) {
            return res.status(400).json({ error: "User is not verified" });
        }
        const hashedPassword = user.password;
        // Compare passwords
        const isMatch = (0, comparePassword_1.comparePassword)(password, hashedPassword);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }
        // get all user organization roles
        const userOrganizationRoles = await client_1.default.userOrganizationRole.findMany({
            where: {
                userId: user.id,
            },
            include: {
                role: true,
            },
        });
        // Fetch roles
        const roles = user.userOrganizationRoles.map((userOrganizationRole) => userOrganizationRole.role.name);
        const organizationId = user.userOrganizationRoles.length > 0
            ? user.userOrganizationRoles[0].organizationId
            : null;
        // Create token data
        const tokenData = {
            id: user.id,
            email: user.email,
            name: user.name,
            userType: user.userType,
            isVerified: user.isVerified,
            organizations: user.userOrganizationRoles.map((userOrgRole) => ({
                organizationId: userOrgRole.organizationId,
            })),
            organizationId: organizationId,
            roles,
            createdAt: new Date().toISOString(), // temporarily store the token creation date
        };
        // Create token
        const loginToken = (0, generateToken_1.generateToken)(tokenData);
        // Set the token in the Authorization header
        res.setHeader("Authorization", `Bearer ${loginToken}`);
        res.json({
            message: `Logged in successfully as ${user.userType.toLowerCase()}`,
            success: true,
            token: loginToken,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.default = router;
