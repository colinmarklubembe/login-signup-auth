import prisma from "../../prisma/client";
import { LeadStatus } from "@prisma/client";
import { BusinessType } from "@prisma/client";

const createContact = async (
  fullName: string,
  contactEmail: string,
  phoneNumber: string,
  title: string,
  leadStatus: LeadStatus = LeadStatus.LEAD,
  location: string,
  businessType: BusinessType,
  description: string,
  email: string
) => {
  if (
    !fullName ||
    !contactEmail ||
    !phoneNumber ||
    !title ||
    !location ||
    !businessType ||
    !description
  ) {
    throw { status: 400, message: "Missing required fields" };
  }

  // Check if the user exists in the database
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw { status: 404, message: "User not found" };
  }

  const addedByUserId = user.id;

  return prisma.contact.create({
    data: {
      fullName,
      contactEmail,
      phoneNumber,
      title,
      leadStatus,
      location,
      businessType,
      description,
      addedByUserId,
    },
  });
};

const getContactById = async (id: string) => {
  return await prisma.contact.findUnique({
    where: { id },
  });
};

const getAllContacts = async () => {
  return prisma.contact.findMany();
};

const updateContact = async (
  id: string,
  data: {
    fullName?: string;
    contactEmail?: string;
    phoneNumber?: string;
    title?: string;
    leadStatus?: LeadStatus;
    leadScore?: number;
    location?: string;
    businessType?: BusinessType;
    description?: string;
  }
) => {
  return await prisma.contact.update({
    where: {
      id,
    },
    data,
  });
};

const deleteContact = async (id: string) => {
  return await prisma.contact.delete({
    where: {
      id,
    },
  });
};

export default {
  createContact,
  getContactById,
  getAllContacts,
  updateContact,
  deleteContact,
};
