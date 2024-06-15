"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePasswordStrength = void 0;
const zxcvbn_1 = __importDefault(require("zxcvbn"));
const validatePasswordStrength = (password, res) => {
    const minLength = 8;
    const result = (0, zxcvbn_1.default)(password);
    const passwordStrength = password.length >= minLength && result.score >= 3;
    if (!passwordStrength) {
        return res.status(400).json({
            error: "Password is too weak. It should be at least 8 characters long!",
        });
    }
};
exports.validatePasswordStrength = validatePasswordStrength;
