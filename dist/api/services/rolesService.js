"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importDefault(require("../../prisma/client"));
const getRoles = (res) => {
    try {
        return client_1.default.role.findMany();
    }
    catch (error) {
        console.error("Error fetching roles", error);
        res.status(500).send("Error fetching roles");
    }
};
exports.default = { getRoles };
