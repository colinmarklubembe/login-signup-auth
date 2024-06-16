import { UserType, LeadStatus, BusinessType } from "@prisma/client";

export enum UserType {
  OWNER,
  ADMIN,
  USER,
}

export enum LeadStatus {
  LEAD,
  PROSPECT,
  CUSTOMER,
}

export enum BusinessType {
  INDIVIDUAL,
  BUSINESS,
}
