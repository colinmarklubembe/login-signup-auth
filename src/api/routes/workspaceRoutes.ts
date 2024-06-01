import { Router } from "express";
import workspaceController from "../controllers/workspaceController";

const router = Router();

router.post("/create-workspace", workspaceController.createWorkspace);

export default router;
