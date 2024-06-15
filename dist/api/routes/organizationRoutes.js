"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const organizationController_1 = __importDefault(require("../controllers/organizationController"));
const authenticate_1 = __importDefault(require("../middleware/authenticate"));
const router = (0, express_1.Router)();
router.post("/create-organization", authenticate_1.default, organizationController_1.default.createOrganization);
router.put("/update-organization/:id", organizationController_1.default.updateOrganization);
router.get("/organization", authenticate_1.default, organizationController_1.default.getOrganizationById);
router.get("/organizations", organizationController_1.default.getAllOrganizations);
router.delete("/delete-organization/:id", authenticate_1.default, organizationController_1.default.deleteOrganization);
router.post("/select-organization", authenticate_1.default, organizationController_1.default.selectOrganization);
router.get("/user-organizations", authenticate_1.default, organizationController_1.default.getUserOrganizations);
exports.default = router;
