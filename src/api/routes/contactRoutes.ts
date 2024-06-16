import { Router } from "express";
import contactController from "../controllers/contactController";
import authenticateToken from "../middleware/authenticate";

const router = Router();

router.post("/create-contact", authenticateToken, contactController.createContact);
router.put("/update-contact/:id", contactController.updateContact);

router.get("/get-contacts", contactController.getAllContacts);

router.get("/get-contact/:id", contactController.getContactById);
router.delete("/delete-contact/:id", contactController.deleteContact);

export default router;
