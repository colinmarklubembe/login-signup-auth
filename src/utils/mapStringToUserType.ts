import { UserType } from "@prisma/client";

// Helper function to map string to UserType
const mapStringToUserType = (userType: string): UserType => {
  switch (userType.toUpperCase()) {
    case "OWNER":
      return UserType.OWNER;
    case "ADMIN":
      return UserType.ADMIN;
    case "USER":
      return UserType.USER;
    default:
      throw { status: 400, message: "Invalid user type" };
  }
};

export default mapStringToUserType;
