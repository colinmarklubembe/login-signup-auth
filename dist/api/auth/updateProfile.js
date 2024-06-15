"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = __importDefault(require("../../prisma/client"));
const sendEmails_1 = __importDefault(require("../../utils/sendEmails"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
router.put("/update-profile", async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const user = await client_1.default.user.findUnique({
            where: {
                id,
            },
        });
        if (!user) {
            return res.status(404).json({ error: "User does not exist" });
        }
        if (!name) {
            return res
                .status(400)
                .send("Missing required fields for updating a user profile");
        }
        // send update profile email to user
        const emailTokenData = {
            email: user.email,
            name: user.name,
        };
        const generateEmailToken = jsonwebtoken_1.default.sign(emailTokenData, process.env.JWT_SECRET);
        // Send invitation email
        sendEmails_1.default.sendInviteEmail(generateEmailToken, res);
        const updatedUser = await client_1.default.user.update({
            where: {
                id,
            },
            data: {
                name,
                updatedAt: new Date().toISOString(),
            },
        });
        console.log("User updated successfully");
        res.status(200).json({ message: "Updated User:", updatedUser });
    }
    catch (error) {
        console.error("Error updating user", error);
        res.status(500).send("Error updating user");
    }
});
exports.default = router;
