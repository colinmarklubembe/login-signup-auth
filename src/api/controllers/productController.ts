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
      return res.status(400).send("All fields are required");
    }

    const newProduct = await productService.createProduct(
      name,
      unitPrice,
      description,
      organizationId
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

const getProductsByOrganizationId = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { organizationId } = req.user!;
    const { id } = req.params;

    // check if the organization exists in the database
    const organization = await prisma.organization.findUnique({
      where: {
        id,
      },
    });

    if (!organization) {
      return res.status(404).json({ error: "Organization does not exist" });
    }

    // match the id in the token with the organization id in the params
    if (organizationId !== id) {
      return res
        .status(403)
        .json({ error: "You are not authorized to view this organization's products" });
    }

    const products = await productService.getProductsByOrganizationId(
      organizationId,
      res
    );

    res.status(200).json({ message: "Products:", products });
  } catch (error) {
    console.error("Error getting products", error);
    res.status(500).send("Error getting products");
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
