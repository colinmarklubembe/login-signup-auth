import prisma from "../../prisma/client";

class ProductService {
  async createProduct(data: any) {
    return prisma.product.create({
      data,
    });
  }

  async updateProduct(productId: string, data: any) {
    return prisma.product.update({
      where: { id: productId },
      data,
    });
  }

  async findProductById(productId: string) {
    return prisma.product.findUnique({
      where: { id: productId },
    });
  }

  async getAllOrganizationProducts(
    organizationId: string,
    page: number,
    limit: number
  ) {
    const skip = (page - 1) * limit;
    const products = await prisma.product.findMany({
      where: { organizationId },
      skip: skip,
      take: limit,
    });

    const totalProducts = await prisma.product.count({
      where: { organizationId },
    });

    return {
      products,
      totalProducts,
    };
  }

  async deleteProduct(productId: string) {
    return prisma.product.delete({
      where: { id: productId },
    });
  }

  async findProductByName(name: string) {
    return prisma.product.findFirst({
      where: { name },
    });
  }
}

export default new ProductService();
