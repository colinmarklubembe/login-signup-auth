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
  organizationController.updateOrganization
);

router.get("/organizations/:id", organizationController.getOrganizationById);

router.get("/organizations", organizationController.getAllOrganizations);

router.delete(
  "/delete-organization/:id",
  authenticateToken,
  organizationController.deleteOrganization
);

router.post(
  "/select-organization",
  authenticateToken,
  organizationController.selectOrganization
);

router.get(
  "/user-organizations",
  authenticateToken,
  organizationController.getUserOrganizations
);

export default router;
