"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importDefault(require("../prisma/client"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sendEmails_1 = __importDefault(require("./sendEmails"));
const generateToken_1 = require("./generateToken");
const verifyUser = async (token, res) => {
    if (!token) {
        return res.status(400).json({ error: "Invalid token" });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // check if a token exists in the database
        const checkUser = await client_1.default.user.findUnique({
            where: { id: decoded.id },
            select: { verificationToken: true },
        });
        // check if both tokens match
        if (checkUser?.verificationToken !== token) {
            return res.status(400).json({ error: "Invalid token" });
        }
        // check if token has expired
        const tokenAge = Date.now() - new Date(decoded.createdAt).getTime();
        if (tokenAge > 3600000) {
            return res.status(400).json({ error: "Token has expired" });
        }
        const user = await client_1.default.user.update({
            where: { id: decoded.id },
            data: {
                isVerified: true,
                verificationToken: null,
                updatedAt: new Date().toISOString(),
            },
        });
        res.redirect("http://localhost:3000/verifiedEmail");
    }
    catch (error) {
        console.error("Error verifying user account: ", error);
        res.status(400).send({ message: "Error verifying user account" });
    }
};
const reverifyUser = async (email, res) => {
    try {
        const user = await client_1.default.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        if (user.isVerified) {
            return res.status(400).json({ error: "User is already verified" });
        }
        // create token data with timestamp
        const tokenData = {
            id: user.id,
            email: user.email,
            username: user.name,
            createdAt: user.createdAt,
            userType: user.userType,
        };
        // Create token
        const token = (0, generateToken_1.generateToken)(tokenData);
        // update the token in the database
        await client_1.default.user.update({
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
        console.error("Error re-verifying user account:", error);
        res.status(400).send({ message: "Error re-verifying user's account" });
    }
};
exports.default = { verifyUser, reverifyUser };
