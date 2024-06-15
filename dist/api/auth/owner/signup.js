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
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    //validate password strength
    (0, checkPasswordStrength_1.validatePasswordStrength)(password, res);
    await (0, createUserAndAssignRole_1.createUserAndAssignRole)(name, email, password, client_1.UserType.OWNER, res);
});
exports.default = router;
