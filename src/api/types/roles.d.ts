import { UserType, LeadStatus } from "@prisma/client";

export enum UserType {
  OWNER = "owner",
  ADMIN = "admin",
  USER = "user",
}

export enum LeadStatus {
  NEW = "new",
  CONTACTED = "contacted",
  IN_PROGRESS = "in_progress",
  CLOSED = "closed",
}
