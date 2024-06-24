import { Router } from "express";
import productController from "../controllers/productController";
import authenticate from "../middleware/authenticate";
import checkMissingFields from "../middleware/checkMissingFields";

const router = Router();

router.post(
  "/create-product",
  checkMissingFields(["name", "unitPrice", "description"]),
  authenticate.authenticateToken,
  productController.createProduct
);
router.put(
  "/update-product/:id",
  checkMissingFields(["name", "unitPrice", "description"]),
  productController.updateProduct
);
router.get("/product/:id", productController.getProductById);
router.get("/products", productController.getAllProducts);
router.delete("/delete-product/:id", productController.deleteProduct);
router.get(
  "/products-org/:id",
  authenticate.authenticateToken,
  productController.getProductsByOrganizationId
);

export default router;
