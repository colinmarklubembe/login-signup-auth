import prisma from "../../prisma/client";

class SalesService {
  async createSale(data: any) {
    return await prisma.sale.create({
      data: {
        ...data,
      },
    });
  }

  async getSales() {
    return await prisma.sale.findMany();
  }

  async findSaleById(id: string) {
    return await prisma.sale.findUnique({
      where: {
        id,
      },
    });
  }

  async updateSale(id: string, newData: any) {
    return await prisma.sale.update({
      where: {
        id,
      },
      data: {
        ...newData,
      },
    });
  }

  async getSalesByOrganization(
    organizationId: string,
    page: number,
    limit: number
  ) {
    const skip = (page - 1) * limit;
    const sales = await prisma.sale.findMany({
      where: {
        organizationId: organizationId,
      },
      skip: skip,
      take: limit,
    });

    const totalSales = await prisma.sale.count({
      where: {
        organizationId: organizationId,
      },
    });

    return {
      sales,
      totalSales,
    };
  }
}

export default new SalesService();
