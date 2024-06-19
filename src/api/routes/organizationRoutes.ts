import { Router } from "express";
import organizationController from "../controllers/organizationController";
import authenticateToken from "../middleware/authenticate";
import checkMissingFields from "../middleware/checkMissingFields";

const router = Router();

router.post(
  "/create-organization",
  checkMissingFields([
    "name",
    "address",
    "phoneNumber",
    "organizationEmail",
  ]),
  authenticateToken,
  organizationController.createOrganization
);

router.put(
  "/update-organization/:id",
  checkMissingFields([
    "name",
    "description",
    "address",
    "phoneNumber",
    "organizationEmail",
  ]),
  organizationController.updateOrganization
);

router.get(
  "/organization",
  authenticateToken,
  organizationController.getOrganizationById
);

router.get("/organizations", organizationController.getAllOrganizations);

router.delete(
  "/delete-organization/:id",
  authenticateToken,
  organizationController.deleteOrganization
);

router.post(
  "/select-organization",
  checkMissingFields(["organizationName"]),
  authenticateToken,
  organizationController.selectOrganization
);

router.get(
  "/user-organizations",
  authenticateToken,
  organizationController.getUserOrganizations
);

export default router;
