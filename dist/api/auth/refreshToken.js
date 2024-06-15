"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// import { verifyRefreshTokenMiddleware } from "../middleware/authenticateRefreshToken";
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = __importDefault(require("../../prisma/client"));
const authenticate_1 = __importDefault(require("../middleware/authenticate"));
const router = (0, express_1.Router)();
router.get("/refresh-token", authenticate_1.default, async (req, res) => {
    try {
        // Fetch the latest user data from the database
        const user = await client_1.default.user.findUnique({
            where: { id: req.user.id },
            include: {
                userOrganizationRoles: {
                    include: {
                        role: true,
                    },
                },
            },
        });
        if (!user) {
            return res.status(400).json({ error: "Invalid token" });
        }
        // Fetch roles
        const roles = user.userOrganizationRoles.map((userOrganizationRole) => userOrganizationRole.role.name);
        const organizationId = user.userOrganizationRoles.length > 0
            ? user.userOrganizationRoles[0].organizationId
            : null;
        // Create new token data with updated information
        const newTokenData = {
            id: user.id,
            email: user.email,
            name: user.name,
            userType: user.userType,
            isVerified: user.isVerified,
            organizationId: organizationId,
            roles,
            createdAt: new Date().toISOString(), // Store the token creation date
        };
        // Create a new token
        const newToken = jsonwebtoken_1.default.sign(newTokenData, process.env.JWT_SECRET, {
            expiresIn: "1h", // Set token expiration time
        });
        res.setHeader("Authorization", `Bearer ${newToken}`);
        res.json({
            message: "Token refreshed successfully",
            success: true,
            token: newToken,
        });
    }
    catch (error) {
        console.error("Error in refresh token route:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.default = router;
