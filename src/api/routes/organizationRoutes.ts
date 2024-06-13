import { Router } from "express";
import organizationController from "../controllers/organizationController";
import authenticateToken from "../middleware/authenticate";

const router = Router();

router.post(
  "/create-organization",
  authenticateToken,
  organizationController.createOrganization
);
router.put(
  "/update-organization/:id",
  authenticateToken,
  organizationController.updateOrganization
);

export default router;
