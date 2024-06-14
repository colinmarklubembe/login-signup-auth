import { Router } from "express";
import rolesController from "../controllers/rolesController";

const router = Router();

router.get("/get-roles", rolesController.getRoles);

export default router;
