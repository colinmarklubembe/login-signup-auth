import { Router } from "express";
import { checkMissingFields, authenticate } from "../middleware";
import { leadController } from "../controllers";

const router = Router();

router.post(
  "/create-lead",
  checkMissingFields([
    "fullName",
    "leadEmail",
    "phoneNumber",
    "title",
    "leadStatus",
    "location",
    "businessType",
    "description",
  ]),
  authenticate.authenticateToken,
  authenticate.checkOrganizationId,
  leadController.createLead
);
router.put(
  "/update-lead/:id",
  checkMissingFields([
    "fullName",
    "leadEmail",
    "phoneNumber",
    "title",
    "leadStatus",
    "location",
    "businessType",
    "description",
  ]),
  leadController.updateLead
);

router.get("/get-leads", leadController.getAllLeads);

router.get("/get-lead/:id", leadController.getLeadById);
router.delete("/delete-lead/:id", leadController.deleteLead);
router.get(
  "/get-leads-by-organization",
  authenticate.checkOrganizationId,
  leadController.getLeadsByOrganization
);

router.post("/change-status/:id", leadController.changeLeadStatus);

export default router;
