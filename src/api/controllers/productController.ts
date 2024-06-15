import { Request, Response } from "express";
import productService from "../services/productService";
import prisma from "../../prisma/client";

const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, unitPrice, description } = req.body;

    if (!name || !unitPrice || !description) {
      return res.status(400).send("All fields are required");
    }

    const newProduct = await productService.createProduct(
      name,
      unitPrice,
      description
    );
    console.log("Product created successfully");
    res.status(201).json({ message: "Product:", newProduct });
  } catch (error) {
    console.error("Error creating product", error);
    res.status(500).send("Error creating product");
  }
};

const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, unitPrice, description } = req.body;

    // check if the product exists in the database
    const product = await prisma.product.findUnique({
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

    const updatedProduct = await productService.updateProduct(
      id,
      name,
      unitPrice,
      description
    );
    console.log("Product updated successfully");
    res.status(200).json({ message: "Updated Product:", updatedProduct });
  } catch (error) {
    console.error("Error updating product", error);
    res.status(500).send("Error updating product");
  }
};

const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = productService.getProductById(id, res);

    res.status(200).json({ message: "Product found:", product });
  } catch (error) {
    console.error("Error getting product", error);
    res.status(500).send("Error getting product");
  }
};

const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await productService.getAllProducts();
    res.status(200).json({ message: "All Products:", products });
  } catch (error) {
    console.error("Error getting products", error);
    res.status(500).send("Error getting products");
  }
};

const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = productService.deleteProduct(id, res);

    res.status(200).json({ message: "Deleted Product:", product });
  } catch (error) {
    console.error("Error deleting product", error);
    res.status(500).send("Error deleting product");
  }
};

export default {
  createProduct,
  updateProduct,
  getProductById,
  getAllProducts,
  deleteProduct,
};
