import prisma from "../../prisma/client";
import { Response } from "express";

const createProduct = async (
  name: string,
  unitPrice: number,
  description: string
) => {
  return prisma.product.create({
    data: {
      name,
      unitPrice,
      description,
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

export default {
  createProduct,
  updateProduct,
  getProductById,
  getAllProducts,
  deleteProduct,
};
