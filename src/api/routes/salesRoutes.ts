import { Router } from "express";
import { salesController } from "../controllers";
import { checkMissingFields, authenticate } from "../middleware";

const router = Router();

export default router;
