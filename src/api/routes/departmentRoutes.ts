import { Router } from "express";
import departmentController from "../controllers/departmentController";
import authenticate from "../middleware/authenticate";
import checkMissingFields from "../middleware/checkMissingFields";

const router = Router();

router.post(
  "/create-department",
  checkMissingFields(["name", "description"]),
  authenticate.authenticateToken,
  departmentController.createDepartment
);
router.put(
  "/update-department/:id",
  checkMissingFields(["name", "description"]),
  departmentController.updateDepartment
);

router.get("/get-departments", departmentController.getAllDepartments);

router.get("/get-department/:id", departmentController.getDepartmentById);

router.delete("/delete-department/:id", departmentController.deleteDepartment);

router.get(
  "/get-departments-by-organization",
  authenticate.authenticateToken,
  departmentController.getDepartmentsByOrganization
);

export default router;
