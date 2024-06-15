"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rolesService_1 = __importDefault(require("../services/rolesService"));
const getRoles = async (req, res) => {
    try {
        const roles = await rolesService_1.default.getRoles(res);
        res.status(200).json({ Roles: roles });
    }
    catch (error) {
        console.error("Error fetching roles", error);
        res.status(500).send("Error fetching roles");
    }
};
exports.default = { getRoles };
