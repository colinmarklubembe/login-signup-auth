import { Router } from "express";
import organizationController from "../controllers/organizationController";
import authenticate from "../middleware/authenticate";
import checkMissingFields from "../middleware/checkMissingFields";

const router = Router();

router.post(
  "/create-organization",
  checkMissingFields(["name", "address", "phoneNumber", "organizationEmail"]),
  authenticate.authenticateToken,
  organizationController.createOrganization
);

router.put(
  "/update-organization/:id",
  checkMissingFields(["name", "address", "phoneNumber", "organizationEmail"]),
  organizationController.updateOrganization
);

router.get(
  "/organization",
  authenticate.checkOrganizationId,
  organizationController.getOrganizationById
);

router.get("/organizations", organizationController.getAllOrganizations);

router.delete(
  "/delete-organization/:id",
  authenticate.authenticateToken,
  organizationController.deleteOrganization
);

router.post(
  "/select-organization",
  checkMissingFields(["organizationName"]),
  organizationController.selectOrganization
);

router.get(
  "/user-organizations",
  authenticate.authenticateToken,
  organizationController.getUserOrganizations
);

export default router;
