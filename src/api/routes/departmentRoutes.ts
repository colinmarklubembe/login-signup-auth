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

export default router;
