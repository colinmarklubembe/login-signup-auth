"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const checkVerification_1 = __importDefault(require("../../utils/checkVerification"));
const router = (0, express_1.Router)();
// verify user
router.get("/verify", async (req, res) => {
    const token = req.query.token;
    await checkVerification_1.default.verifyUser(token, res);
});
//reverify user
router.post("/reverify", async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    await checkVerification_1.default.reverifyUser(email, res);
});
exports.default = router;
