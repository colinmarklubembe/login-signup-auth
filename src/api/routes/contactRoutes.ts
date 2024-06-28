import { Router } from "express";
import { checkMissingFields, authenticate } from "../middleware";
import { contactController } from "../controllers";

const router = Router();

router.post(
  "/create-contact",
  checkMissingFields([
    "fullName",
    "contactEmail",
    "phoneNumber",
    "title",
    "leadStatus",
    "location",
    "businessType",
    "description",
  ]),
  authenticate.authenticateToken,
  authenticate.checkOrganizationId,
  contactController.createContact
);
router.put(
  "/update-contact/:id",
  checkMissingFields([
    "fullName",
    "contactEmail",
    "phoneNumber",
    "title",
    "leadStatus",
    "location",
    "businessType",
    "description",
  ]),
  contactController.updateContact
);

router.get("/get-contacts", contactController.getAllContacts);

router.get("/get-contact/:id", contactController.getContactById);
router.delete("/delete-contact/:id", contactController.deleteContact);
router.get(
  "/get-contacts-by-organization",
  authenticate.checkOrganizationId,
  contactController.getContactsByOrganization
);

export default router;
