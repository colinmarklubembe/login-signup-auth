import { Router } from "express";
import departmentController from "../controllers/departmentController";
import authenticate from "../middleware/authenticate";
import checkMissingFields from "../middleware/checkMissingFields";

const router = Router();

router.post(
  "/create-department",
  checkMissingFields(["name", "description"]),
  authenticate.authenticateToken,
  authenticate.checkOrganizationId,
  departmentController.createDepartment
);
router.put(
  "/update-department/:id",
  checkMissingFields(["name"]),
  departmentController.updateDepartment
);

router.get("/get-departments", departmentController.getAllDepartments);

router.get("/get-department/:id", departmentController.getDepartmentById);

router.delete("/delete-department/:id", departmentController.deleteDepartment);

router.get(
  "/get-departments-by-organization",
  authenticate.checkOrganizationId,
  departmentController.getDepartmentsByOrganization
);

export default router;
