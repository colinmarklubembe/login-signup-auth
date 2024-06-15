"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const createUserAndAssignRole_1 = require("../../../utils/createUserAndAssignRole");
const generateRandonPassword_1 = __importDefault(require("../../../utils/generateRandonPassword"));
const authenticate_1 = __importDefault(require("../../middleware/authenticate"));
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// invite users
router.post("/invite-user", authenticate_1.default, async (req, res) => {
    const { name, email, userType, userOrganizationRoles, departmentName } = req.body;
    const { organizationId } = req.user;
    if (!name ||
        !email ||
        !userType ||
        !userOrganizationRoles ||
        !departmentName) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    // check if user type is valid
    if (!Object.values(client_1.UserType).includes(userType)) {
        return res.status(400).json({ error: "Invalid user type" });
    }
    // generate random password
    const password = (0, generateRandonPassword_1.default)();
    // create user
    await (0, createUserAndAssignRole_1.createInvitedUser)(name, email, password, userType, organizationId, userOrganizationRoles, departmentName, res);
});
exports.default = router;
