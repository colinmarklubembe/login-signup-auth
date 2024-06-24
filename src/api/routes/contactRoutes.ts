import { Router } from "express";
import contactController from "../controllers/contactController";
import authenticate from "../middleware/authenticate";
import checkMissingFields from "../middleware/checkMissingFields";

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
  contactController.createContact
);
router.put("/update-contact/:id", contactController.updateContact);

router.get("/get-contacts", contactController.getAllContacts);

router.get("/get-contact/:id", contactController.getContactById);
router.delete("/delete-contact/:id", contactController.deleteContact);

export default router;
