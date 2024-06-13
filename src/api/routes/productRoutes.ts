import { Router } from "express";
import productController from "../controllers/productController";

const router = Router();

router.post("/create-product", productController.createProduct);
router.put("/update-product/:id", productController.updateProduct);
router.get("/product/:id", productController.getProductById);

export default router;
