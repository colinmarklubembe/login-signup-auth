import prisma from "../../prisma/client";

const findOrganizationContact = async (
  name: string,
  organizationId: string
) => {
  return prisma.contact.findFirst({
    where: {
      name,
      organizationId,
    },
  });
};

const createContact = async (data: any) => {
  const createdContact = await prisma.contact.create({
    data,
  });

  // Extract organizationId from createdContact if needed
  const organizationId = createdContact.organizationId;

  return {
    ...createdContact,
    organizationId, // Include organizationId directly in the response
  };
};

const getContactById = async (contactId: string) => {
  return prisma.contact.findUnique({
    where: {
      id: contactId,
    },
  });
};

const getAllContacts = async () => {
  return prisma.contact.findMany();
};

const updateContact = async (contactId: string, newData: any) => {
  return prisma.contact.update({
    where: { id: contactId },
    data: {
      ...newData,
    },
  });
};

const deleteContact = async (id: string) => {
  return prisma.contact.delete({
    where: {
      id,
    },
  });
};

const findContactByEmail = async (contactEmail: string) => {
  return prisma.contact.findUnique({
    where: { contactEmail },
  });
};

const findContactByPhoneNumber = async (phoneNumber: string) => {
  return prisma.contact.findUnique({
    where: { phoneNumber },
  });
};

const findContactById = async (contactId: string) => {
  return prisma.contact.findUnique({
    where: { id: contactId },
  });
};

const getContactsByOrganization = async (organizationId: string) => {
  return await prisma.contact.findMany({
    where: {
      organizationId: organizationId,
    },
  });
};

export default {
  findOrganizationContact,
  createContact,
  getContactById,
  getAllContacts,
  updateContact,
  deleteContact,
  findContactByEmail,
  findContactByPhoneNumber,
  findContactById,
  getContactsByOrganization,
};
