import { Router } from "express";
import organizationController from "../controllers/organizationController";

const router = Router();

router.post("/create-organization", organizationController.createOrganization);
router.put("/update-organization/:id", organizationController.updateOrganization)

export default router;
