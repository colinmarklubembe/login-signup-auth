import { Request, Response } from "express";
import { productService } from "../services";
import { responses } from "../../utils";

interface AuthenticatedRequest extends Request {
  organization?: { organizationId: string };
}

class ProductsController {
  // create product
  async createProduct(req: AuthenticatedRequest, res: Response) {
    try {
      const { name, description, unitPrice } = req.body;
      const { organizationId } = req.organization!;

      const data = {
        name,
        description,
        unitPrice,
        organizationId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const newProduct = await productService.createProduct(data);

      responses.successResponse(res, 201, "Product created successfully", {
        newProduct: newProduct,
      });
    } catch (error: any) {
      responses.errorResponse(res, 500, error.message);
    }
  }

  // update product
  async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, unitPrice } = req.body;

      const productId = id;

      const product = await productService.findProductById(productId);

      if (!product) {
        return responses.errorResponse(res, 404, "Product not found");
      }

      const data = {
        name,
        description,
        unitPrice,
        updatedAt: new Date().toISOString(),
      };

      const updatedProduct = await productService.updateProduct(
        productId,
        data
      );

      responses.successResponse(res, 200, "Product updated successfully", {
        updatedProduct: updatedProduct,
      });
    } catch (error: any) {
      responses.errorResponse(res, 500, error.message);
    }
  }

  // get product by id
  async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const productId = id;

      const product = await productService.findProductById(productId);

      if (!product) {
        return responses.errorResponse(res, 404, "Product not found");
      }

      responses.successResponse(res, 200, "Product retrieved successfully", {
        product: product,
      });
    } catch (error: any) {
      responses.errorResponse(res, 500, error.message);
    }
  }

  // get all organization products
  async getAllOrganizationProducts(req: AuthenticatedRequest, res: Response) {
    try {
      const { organizationId } = req.organization!;

      // Get pagination parameters from the request query
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const { products, totalProducts } =
        await productService.getAllOrganizationProducts(
          organizationId,
          page,
          limit
        );

      const totalPages = Math.ceil(totalProducts / limit);
      const nextPage = page < totalPages ? page + 1 : null;
      const prevPage = page > 1 ? page - 1 : null;

      responses.successResponse(res, 200, "Products retrieved successfully", {
        products,
        totalProducts,
        totalPages,
        nextPage,
        prevPage,
      });
    } catch (error: any) {
      responses.errorResponse(res, 500, error.message);
    }
  }

  // delete product
  async deleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const productId = id;

      const product = await productService.findProductById(productId);

      if (!product) {
        return responses.errorResponse(res, 404, "Product not found");
      }

      await productService.deleteProduct(productId);

      responses.successResponse(res, 200, "Product deleted successfully");
    } catch (error: any) {
      responses.errorResponse(res, 500, error.message);
    }
  }
}

export default new ProductsController();
