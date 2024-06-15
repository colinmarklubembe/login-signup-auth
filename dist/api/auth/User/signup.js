"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const createUserAndAssignRole_1 = require("../../../utils/createUserAndAssignRole");
const checkPasswordStrength_1 = require("../../../utils/checkPasswordStrength");
const router = express_1.default.Router();
router.post("/signup", async (req, res) => {
    const { name, email, password, roles } = req.body;
    if (!name || !email || !password || !roles) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    //validate password strength
    (0, checkPasswordStrength_1.validatePasswordStrength)(password, res);
    const validRoles = ["SALES", "CUSTOMER_SUPPORT", "MARKETING"];
    const userRoles = roles.filter((role) => validRoles.includes(role.toUpperCase()));
    if (userRoles.length === 0) {
        return res.status(400).json({ error: "Invalid roles provided" });
    }
    await (0, createUserAndAssignRole_1.createUserAndAssignRole)(name, email, password, client_1.UserType.USER, res);
});
exports.default = router;
// how to MAKE SURE THE ROLES ARE MADE UPPER CASE HOW
// THEY ARE IN THE DATABASE
