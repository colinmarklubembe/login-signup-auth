import { Router } from "express";
import { productController } from "../controllers";
import { checkMissingFields, authenticate } from "../middleware";

const router = Router();

router.post(
  "/create-product",
  checkMissingFields(["name", "description", "unitPrice"]),
  authenticate.checkOrganizationId,
  productController.createProduct
);

router.put(
  "/update-product/:id",
  checkMissingFields(["name", "description", "unitPrice"]),
  productController.updateProduct
);

router.get("/product/:id", productController.getProductById);

router.get(
  "/organization-products",
  authenticate.checkOrganizationId,
  productController.getAllOrganizationProducts
);

router.delete("/delete-product/:id", productController.deleteProduct);

export default router;
