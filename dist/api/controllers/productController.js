"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const productService_1 = __importDefault(require("../services/productService"));
const client_1 = __importDefault(require("../../prisma/client"));
const createProduct = async (req, res) => {
    try {
        const { name, unitPrice, description } = req.body;
        if (!name || !unitPrice || !description) {
            return res.status(400).send("All fields are required");
        }
        const newProduct = await productService_1.default.createProduct(name, unitPrice, description);
        console.log("Product created successfully");
        res.status(201).json({ message: "Product:", newProduct });
    }
    catch (error) {
        console.error("Error creating product", error);
        res.status(500).send("Error creating product");
    }
};
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, unitPrice, description } = req.body;
        // check if the product exists in the database
        const product = await client_1.default.product.findUnique({
            where: {
                id,
            },
        });
        if (!product) {
            return res.status(404).json({ error: "Product does not exist" });
        }
        if (!name || !unitPrice || !description) {
            return res
                .status(400)
                .send("All fields are required for updating a product");
        }
        const updatedProduct = await productService_1.default.updateProduct(id, name, unitPrice, description);
        console.log("Product updated successfully");
        res.status(200).json({ message: "Updated Product:", updatedProduct });
    }
    catch (error) {
        console.error("Error updating product", error);
        res.status(500).send("Error updating product");
    }
};
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = productService_1.default.getProductById(id, res);
        res.status(200).json({ message: "Product found:", product });
    }
    catch (error) {
        console.error("Error getting product", error);
        res.status(500).send("Error getting product");
    }
};
const getAllProducts = async (req, res) => {
    try {
        const products = await productService_1.default.getAllProducts();
        res.status(200).json({ message: "All Products:", products });
    }
    catch (error) {
        console.error("Error getting products", error);
        res.status(500).send("Error getting products");
    }
};
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = productService_1.default.deleteProduct(id, res);
        res.status(200).json({ message: "Deleted Product:", product });
    }
    catch (error) {
        console.error("Error deleting product", error);
        res.status(500).send("Error deleting product");
    }
};
exports.default = {
    createProduct,
    updateProduct,
    getProductById,
    getAllProducts,
    deleteProduct,
};
