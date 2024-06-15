"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const departmentController_1 = __importDefault(require("../controllers/departmentController"));
const authenticate_1 = __importDefault(require("../middleware/authenticate"));
const router = (0, express_1.Router)();
router.post("/create-department", authenticate_1.default, departmentController_1.default.createDepartment);
router.put("/update-department/:id", departmentController_1.default.updateDepartment);
router.get("/get-departments", departmentController_1.default.getAllDepartments);
router.get("/get-department/:id", departmentController_1.default.getDepartmentById);
router.delete("/delete-department/:id", departmentController_1.default.deleteDepartment);
router.get("/get-departments-by-organization", authenticate_1.default, departmentController_1.default.getDepartmentsByOrganization);
exports.default = router;
