import { UserType, LeadStatus, BusinessType } from "@prisma/client";
import { Response } from "express";

// Helper function to map string to UserType
const mapStringToUserType = (
  userType: string,
  res: Response
): UserType | Response<any> => {
  switch (userType.toUpperCase()) {
    case "OWNER":
      return UserType.OWNER;
    case "ADMIN":
      return UserType.ADMIN;
    case "USER":
      return UserType.USER;
    default:
      return res
        .status(400)
        .json({ success: false, error: "Invalid user type" });
  }
};

const mapStringToLeadStatus = (
  leadStatus: string,
  res: Response
): LeadStatus | Response<any> => {
  switch (leadStatus.toUpperCase()) {
    case "LEAD":
      return LeadStatus.LEAD;
    case "PROSPECT":
      return LeadStatus.PROSPECT;
    case "CUSTOMER":
      return LeadStatus.CUSTOMER;
    default:
      return res
        .status(400)
        .json({ success: false, error: "Invalid lead status" });
  }
};

const mapStringToBusinessType = (
  businessType: string,
  res: Response
): BusinessType | Response<any> => {
  switch (businessType.toUpperCase()) {
    case "INDIVIDUAL":
      return BusinessType.INDIVIDUAL;
    case "BUSINESS":
      return BusinessType.BUSINESS;
    default:
      return res
        .status(400)
        .json({ success: false, error: "Invalid business type" });
  }
};

export default {
  mapStringToUserType,
  mapStringToLeadStatus,
  mapStringToBusinessType,
};
