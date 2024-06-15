"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = __importDefault(require("../controllers/productController"));
const router = (0, express_1.Router)();
router.post("/create-product", productController_1.default.createProduct);
router.put("/update-product/:id", productController_1.default.updateProduct);
router.get("/product/:id", productController_1.default.getProductById);
router.get("/products", productController_1.default.getAllProducts);
router.delete("/delete-product/:id", productController_1.default.deleteProduct);
exports.default = router;
