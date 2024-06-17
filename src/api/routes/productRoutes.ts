import { Router } from "express";
import productController from "../controllers/productController";
import authenticateToken from "../middleware/authenticate";

const router = Router();

router.post(
  "/create-product",
  authenticateToken,
  productController.createProduct
);
router.put("/update-product/:id", productController.updateProduct);
router.get("/product/:id", productController.getProductById);
router.get("/products", productController.getAllProducts);
router.delete("/delete-product/:id", productController.deleteProduct);
router.get(
  "/products-org/:id",
  authenticateToken,
  productController.getProductsByOrganizationId
);

export default router;
