import { responses } from "../../utils";
import { LeadStatus } from "@prisma/client";
import { Request, Response } from "express";
import {
  salesService,
  productService,
  leadService,
  organizationService,
} from "../services";
import userService from "../auth/services/userService";

interface AuthenticatedRequest extends Request {
  organization?: { organizationId: string };
  user?: { email: string };
}

class SalesController {
  async createSale(req: AuthenticatedRequest, res: Response) {
    try {
      const { email } = req.user!;
      const { organizationId } = req.organization!;

      if (!organizationId) {
        return responses.errorResponse(res, 404, "Organization not found");
      }

      const { leadId } = req.params;
      const { productId, quantity, description } = req.body;

      const user = await userService.findUserByEmail(email);

      if (!user) {
        return responses.errorResponse(res, 404, "User not found");
      }
      const userId = user.id;

      // find lead by id
      const lead = await leadService.findLeadById(leadId);

      if (!lead) {
        return responses.errorResponse(res, 404, "Lead not found");
      }

      // find the product by id
      const product = await productService.findProductById(productId);

      if (!product) {
        return responses.errorResponse(res, 404, "Product not found");
      }

      // calculate the total price
      const totalPrice = product.unitPrice * quantity;

      const data = {
        leadId,
        productId,
        userId,
        organizationId,
        quantity,
        totalPrice,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // create the sale
      const sale = await salesService.createSale(data);

      // update the lead status to CLOSED
      const newData = {
        leadStatus: LeadStatus.CLOSED,
        description: description,
        updatedAt: new Date().toISOString(),
      };

      const updatedLead = await leadService.updateLead(leadId, newData);

      responses.successResponse(
        res,
        201,
        `Sale has been closed successfully!`,
        {
          sale: sale,
          lead: updatedLead,
          totalPrice: totalPrice,
        }
      );
    } catch (error: any) {
      responses.errorResponse(res, 500, error.message);
    }
  }

  async updateSale(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { productId, quantity, description } = req.body;

      // find the sale by id
      const sale = await salesService.findSaleById(id);

      if (!sale) {
        return responses.errorResponse(res, 404, "Sale record not found");
      }

      // find the product by id
      const product = await productService.findProductById(productId);

      if (!product) {
        return responses.errorResponse(res, 404, "Product not found");
      }

      // calculate the total price
      const totalPrice = product.unitPrice * quantity;

      const newData = {
        quantity,
        description,
        totalPrice,
        updatedAt: new Date().toISOString(),
      };

      const updatedSale = await salesService.updateSale(id, newData);

      responses.successResponse(res, 200, "Sale updated successfully", {
        updatedSale: updatedSale,
      });
    } catch (error: any) {
      responses.errorResponse(res, 500, error.message);
    }
  }

  async getSaleById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const sale = await salesService.findSaleById(id);
      responses.successResponse(res, 500, "Sale found", { sale: sale });
    } catch (error: any) {
      responses.errorResponse(res, 500, error.message);
    }
  }

  // get all organization sales including pagination
  async getSales(req: AuthenticatedRequest, res: Response) {
    try {
      const { organizationId } = req.organization!;

      // Check if the organization exists
      const organization = await organizationService.findOrganizationById(
        organizationId
      );

      if (!organization) {
        return responses.errorResponse(res, 404, "Organization not found");
      }

      // Get pagination parameters from the request query
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const { sales, totalSales } = await salesService.getSalesByOrganization(
        organizationId,
        page,
        limit
      );

      if (!sales) {
        return responses.errorResponse(
          res,
          404,
          `Sales not found for this organization!`
        );
      }

      const totalPages = Math.ceil(totalSales / limit);
      const nextPage = page < totalPages ? page + 1 : null;
      const prevPage = page > 1 ? page - 1 : null;

      responses.successResponse(res, 200, "Sales found", {
        sales: sales,
        totalSales: totalSales,
        totalPages: totalPages,
        currentPage: page,
        nextPage: nextPage,
        prevPage: prevPage,
      });
    } catch (error: any) {
      responses.errorResponse(res, 500, error.message);
    }
  }

  // sales dashboard API
  async getSalesDashboard(req: AuthenticatedRequest, res: Response) {
    try {
      const { organizationId } = req.organization!;

      // Check if the organization exists
      const organization = await organizationService.findOrganizationById(
        organizationId
      );

      if (!organization) {
        return responses.errorResponse(res, 404, "Organization not found");
      }

      // Get pagination parameters from the request query
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const { sales, totalSales } = await salesService.getSalesByOrganization(
        organizationId,
        page,
        limit
      );

      if (!sales) {
        return responses.errorResponse(
          res,
          404,
          `Sales not found for this organization!`
        );
      }

      // calculate the total sales
      const salesTotals = sales.reduce(
        (total: number, sale: any) => total + sale.totalPrice,
        0
      );

      // calculate the total sales count
      const totalSalesCount = sales.length;

      // get the top 5 products sold
      const products = sales.map((sale: any) => {
        return {
          productId: sale.productId,
          quantity: sale.quantity,
          totalPrice: sale.totalPrice,
        };
      });

      const topProducts = products.reduce((acc: any, product: any) => {
        if (!acc[product.productId]) {
          acc[product.productId] = {
            productId: product.productId,
            quantity: 0,
            totalPrice: 0,
          };
        }

        acc[product.productId].quantity += product.quantity;
        acc[product.productId].totalPrice += product.totalPrice;

        return acc;
      }, {});

      const topProductsArray = Object.values(topProducts)
        .sort((a: any, b: any) => b.quantity - a.quantity)
        .slice(0, 5);

      responses.successResponse(res, 200, "Sales dashboard data", {
        totalSales: salesTotals,
        totalSalesCount: totalSalesCount,
        topProducts: topProductsArray,
      });
    } catch (error: any) {
      responses.errorResponse(res, 500, error.message);
    }
  }
}

export default new SalesController();
