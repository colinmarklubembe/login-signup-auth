"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importDefault(require("../../prisma/client"));
const createProduct = async (name, unitPrice, description) => {
    return client_1.default.product.create({
        data: {
            name,
            unitPrice,
            description,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
    });
};
const updateProduct = async (id, name, unitPrice, description) => {
    return client_1.default.product.update({
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
const getProductById = async (id, res) => {
    const product = await client_1.default.product.findUnique({
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
    return client_1.default.product.findMany();
};
const deleteProduct = async (id, res) => {
    const product = await client_1.default.product.findUnique({
        where: {
            id,
        },
    });
    if (!product) {
        return res.status(404).json({ error: "Product does not exist" });
    }
    await client_1.default.product.delete({
        where: {
            id,
        },
    });
    return product;
};
exports.default = {
    createProduct,
    updateProduct,
    getProductById,
    getAllProducts,
    deleteProduct,
};
