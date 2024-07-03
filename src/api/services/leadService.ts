import prisma from "../../prisma/client";

class LeadService {
  async findOrganizationLead(name: string, organizationId: string) {
    return prisma.lead.findFirst({
      where: {
        name,
        organizationId,
      },
    });
  }

  async createLead(data: any) {
    const createdLead = await prisma.lead.create({
      data,
    });

    // Extract organizationId from createdlead if needed
    const organizationId = createdLead.organizationId;

    return {
      ...createdLead,
      organizationId, // Include organizationId directly in the response
    };
  }

  async getLeadById(leadId: string) {
    return prisma.lead.findUnique({
      where: {
        id: leadId,
      },
    });
  }

  async getAllLeads() {
    return prisma.lead.findMany();
  }

  async updateLead(leadId: string, newData: any) {
    return prisma.lead.update({
      where: { id: leadId },
      data: {
        ...newData,
      },
    });
  }

  async deleteLead(id: string) {
    return prisma.lead.delete({
      where: {
        id,
      },
    });
  }

  async findLeadByEmail(leadEmail: string) {
    return prisma.lead.findUnique({
      where: { leadEmail },
    });
  }

  async findLeadByPhoneNumber(phoneNumber: string) {
    return prisma.lead.findUnique({
      where: { phoneNumber },
    });
  }

  async findLeadById(leadId: string) {
    return prisma.lead.findUnique({
      where: { id: leadId },
    });
  }

  async getLeadsByOrganization(
    organizationId: string,
    page: number,
    limit: number
  ) {
    const skip = (page - 1) * limit;
    const leads = await prisma.lead.findMany({
      where: {
        organizationId: organizationId,
      },
      skip: skip,
      take: limit,
    });

    const totalLeads = await prisma.lead.count({
      where: {
        organizationId: organizationId,
      },
    });

    return {
      leads,
      totalLeads,
    };
  }

  async getOrganizationLeads(organizationId: string, leadStatus: string) {
    try {
      const leads = await prisma.lead.findMany({
        where: {
          organizationId,
          leadStatus,
        },
      });

      return leads;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async attachProductToLead(productId: string, leadId: string) {
    return prisma.lead.update({
      where: { id: leadId },
      data: {
        products: {
          connect: {
            id: productId,
          },
        },
      },
    });
  }
}

export default new LeadService();
