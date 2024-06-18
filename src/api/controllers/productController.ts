import { Request, Response } from "express";
import productService from "../services/productService";
import prisma from "../../prisma/client";

interface AuthenticatedRequest extends Request {
  user?: { email: string; organizationId: string };
}

const createProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, unitPrice, description } = req.body;
    const { organizationId } = req.user!;

    if (!name || !unitPrice || !description) {
      throw {
        status: 400,
        message: "All fields are required for creating a product",
      };
    }

    const newProduct = await productService.createProduct(
      name,
      unitPrice,
      description,
      organizationId
    );
    console.log("Product created successfully");
    res.status(201).json({ message: "Product:", newProduct });
  } catch (error: any) {
    console.error("Error creating product", error);
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server Error" });
  }
};

const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, unitPrice, description } = req.body;

    const updatedProduct = await productService.updateProduct(
      id,
      name,
      unitPrice,
      description
    );
    console.log("Product updated successfully");
    res.status(200).json({ message: "Updated Product:", updatedProduct });
  } catch (error: any) {
    console.error("Error updating product", error);
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server Error" });
  }
};

const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = productService.getProductById(id, res);

    res.status(200).json({ message: "Product found:", product });
  } catch (error: any) {
    console.error("Error getting product", error);
    res.status(error.status || 500).json({ message: error.message });
  }
};

const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await productService.getAllProducts();
    res.status(200).json({ message: "All Products:", products });
  } catch (error: any) {
    console.error("Error getting products", error);
    res.status(500).send("Error getting products");
  }
};

const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = productService.deleteProduct(id, res);

    res.status(200).json({ message: "Deleted Product:", product });
  } catch (error: any) {
    console.error("Error deleting product", error);
    res.status(error.status || 500).json({ message: error.message });
  }
};

const getProductsByOrganizationId = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { organizationId } = req.user!;
    const { id } = req.params;

    const products = await productService.getProductsByOrganizationId(
      organizationId,
      id
    );

    res.status(200).json({ message: "Products:", products });
  } catch (error: any) {
    console.error("Error getting products", error);
    res.status(error.status || 500).json({ message: error.message });
  }
};

export default {
  createProduct,
  updateProduct,
  getProductById,
  getAllProducts,
  deleteProduct,
  getProductsByOrganizationId,
};
