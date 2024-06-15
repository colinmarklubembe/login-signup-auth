"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rolesController_1 = __importDefault(require("../controllers/rolesController"));
const router = (0, express_1.Router)();
router.get("/get-roles", rolesController_1.default.getRoles);
exports.default = router;
