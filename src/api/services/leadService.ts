import prisma from "../../prisma/client";

const findOrganizationLead = async (name: string, organizationId: string) => {
  return prisma.lead.findFirst({
    where: {
      name,
      organizationId,
    },
  });
};

const createLead = async (data: any) => {
  const createdLead = await prisma.lead.create({
    data,
  });

  // Extract organizationId from createdlead if needed
  const organizationId = createdLead.organizationId;

  return {
    ...createdLead,
    organizationId, // Include organizationId directly in the response
  };
};

const getLeadById = async (leadId: string) => {
  return prisma.lead.findUnique({
    where: {
      id: leadId,
    },
  });
};

const getAllLeads = async () => {
  return prisma.lead.findMany();
};

const updateLead = async (leadId: string, newData: any) => {
  return prisma.lead.update({
    where: { id: leadId },
    data: {
      ...newData,
    },
  });
};

const deleteLead = async (id: string) => {
  return prisma.lead.delete({
    where: {
      id,
    },
  });
};

const findLeadByEmail = async (leadEmail: string) => {
  return prisma.lead.findUnique({
    where: { leadEmail },
  });
};

const findLeadByPhoneNumber = async (phoneNumber: string) => {
  return prisma.lead.findUnique({
    where: { phoneNumber },
  });
};

const findLeadById = async (leadId: string) => {
  return prisma.lead.findUnique({
    where: { id: leadId },
  });
};

const getLeadsByOrganization = async (
  organizationId: string,
  page: number,
  limit: number
) => {
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
};

export default {
  findOrganizationLead,
  createLead,
  getLeadById,
  getAllLeads,
  updateLead,
  deleteLead,
  findLeadByEmail,
  findLeadByPhoneNumber,
  findLeadById,
  getLeadsByOrganization,
};
