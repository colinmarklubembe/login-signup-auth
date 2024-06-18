import prisma from "../../prisma/client";
import { Response } from "express";

const createProduct = async (
  name: string,
  unitPrice: number,
  description: string,
  organizationId: string
) => {
  return prisma.product.create({
    data: {
      name,
      unitPrice,
      description,
      organization: {
        connect: {
          id: organizationId,
        },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  });
};

const updateProduct = async (
  id: string,
  name: string,
  unitPrice: number,
  description: string
) => {
  // check if the product exists in the database
  const product = await prisma.product.findUnique({
    where: {
      id,
    },
  });

  if (!product) {
    throw { status: 404, message: "Product does not exist" };
  }

  return prisma.product.update({
    where: {
      id,
    },
    data: {
      name,
      unitPrice,
      description,
      updatedAt: new Date().toISOString(),
    },
  });
};

const getProductById = async (id: string, res: Response) => {
  const product = await prisma.product.findUnique({
    where: {
      id,
    },
  });

  if (!product) {
    return res.status(404).json({ error: "Product does not exist" });
  }

  return product;
};

const getAllProducts = async () => {
  return prisma.product.findMany();
};

const deleteProduct = async (id: string, res: Response) => {
  const product = await prisma.product.findUnique({
    where: {
      id,
    },
  });

  if (!product) {
    return res.status(404).json({ error: "Product does not exist" });
  }

  await prisma.product.delete({
    where: {
      id,
    },
  });

  return product;
};

const getProductsByOrganizationId = async (
  organizationId: string,
  id: string
) => {
  // check if the organization exists in the database
  const organization = await prisma.organization.findUnique({
    where: {
      id,
    },
  });

  if (!organization) {
    throw { status: 404, message: "Organization does not exist" };
  }

  // match the id in the token with the organization id in the params
  if (organizationId !== id) {
    throw {
      status: 403,
      message: "User is not authorized to view products for this organization",
    };
  }

  const products = await prisma.product.findMany({
    where: {
      organizationId,
    },
  });

  if (products.length === 0) {
    throw { status: 404, message: "No products found for this organization" };
  }

  return products;
};

export default {
  createProduct,
  updateProduct,
  getProductById,
  getAllProducts,
  deleteProduct,
  getProductsByOrganizationId,
};
