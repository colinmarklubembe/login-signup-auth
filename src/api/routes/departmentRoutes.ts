import { Router } from "express";
import departmentController from "../controllers/departmentController";
import authenticateToken from "../middleware/authenticate";

const router = Router();

router.post(
  "/create-department",
  authenticateToken,
  departmentController.createDepartment
);
router.put("/update-department/:id", departmentController.updateDepartment);

router.get("/get-departments", departmentController.getAllDepartments);

router.get("/get-department/:id", departmentController.getDepartmentById);

router.delete("/delete-department/:id", departmentController.deleteDepartment);

router.get(
  "/get-departments-by-organization",
  authenticateToken,
  departmentController.getDepartmentsByOrganization
);

export default router;
