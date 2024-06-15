"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = __importDefault(require("../../prisma/client"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sendEmails_1 = __importDefault(require("../../utils/sendEmails"));
require("dotenv").config();
const router = (0, express_1.Router)();
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    try {
        const user = await client_1.default.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(400).json({ error: "User does not exist" });
        }
        const emailTokenData = {
            id: user.id,
            email: user.email,
            name: user.name,
        };
        const generateEmailToken = jsonwebtoken_1.default.sign(emailTokenData, process.env.JWT_SECRET);
        // send email with password reset link
        sendEmails_1.default.sendForgotPasswordEmail(generateEmailToken, res);
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.default = router;
