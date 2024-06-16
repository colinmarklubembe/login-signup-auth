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
  addedByUserId: string
) => {
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
  return prisma.contact.findUnique({
    where: {
      id,
    },
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
  return prisma.contact.update({
    where: {
      id,
    },
    data,
  });
};

const deleteContact = async (id: string) => {
  return prisma.contact.delete({
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
