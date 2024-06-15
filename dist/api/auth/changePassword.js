"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = __importDefault(require("../../prisma/client"));
const checkPasswordStrength_1 = require("../../utils/checkPasswordStrength");
const hashPassword_1 = require("../../utils/hashPassword");
const router = (0, express_1.Router)();
// update password
router.put("/change-password/:id", async (req, res) => {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;
    try {
        const user = await client_1.default.user.findUnique({
            where: { id },
        });
        if (!user) {
            return res.status(400).json({ error: "User does not exist" });
        }
        // compare old password
        const isMatch = await bcryptjs_1.default.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid old password" });
        }
        const password = newPassword;
        // validate password strength
        (0, checkPasswordStrength_1.validatePasswordStrength)(password, res);
        // hash new password
        const hashedPassword = await (0, hashPassword_1.hashPassword)(password);
        // update password
        const updatedPassword = await client_1.default.user.update({
            where: { id },
            data: {
                password: hashedPassword,
                updatedAt: new Date().toISOString(),
            },
        });
        res.status(200).json({ message: "Password updated successfully" });
    }
    catch (error) {
        return res.status(400).json("Error updating password");
    }
});
// reset password
router.put("/reset-password/:id", async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;
    try {
        const user = await client_1.default.user.findUnique({
            where: { id },
        });
        if (!user) {
            return res.status(400).json({ error: "User does not exist" });
        }
        const password = newPassword;
        // validate password strength
        (0, checkPasswordStrength_1.validatePasswordStrength)(password, res);
        // hash new password
        const hashedPassword = await (0, hashPassword_1.hashPassword)(password);
        // update password
        const updatedPassword = await client_1.default.user.update({
            where: { id },
            data: {
                password: hashedPassword,
            },
        });
        res.status(200).json({ message: "Password reset successfully" });
    }
    catch (error) {
        return res.status(400).json("Error resetting password");
    }
});
exports.default = router;
