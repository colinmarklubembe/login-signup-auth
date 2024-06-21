import prisma from "../../../prisma/client";
import { UserType } from "@prisma/client";
import { hashPassword } from "../../../utils/hashPassword";
import generateRandomPassword from "../../../utils/generateRandonPassword";
import sendEmails from "../../../utils/sendEmails";
import jwt from "jsonwebtoken";
import mapStringToUserType from "../../../utils/mapStringToUserType";
import userService from "./userService";

const inviteUser = async (
  departmentId: string,
  name: string,
  email: string,
  userType: UserType,
  organizationId: string
) => {
  let mappedUserType: UserType;
  try {
    mappedUserType = mapStringToUserType(userType);
  } catch (error) {
    throw { status: 400, message: "Invalid user type" };
  }

  try {
    // Check if user already exists
    const existingUser = await userService.findUserByEmail(email);
    if (existingUser) {
      // check if the department exists
      const department = await prisma.department.findUnique({
        where: { id: departmentId },
      });

      if (!department) {
        throw { status: 400, message: "Department not found" };
      }

      // check if the department belongs to the organization
      if (department.organizationId !== organizationId) {
        throw {
          status: 400,
          message: "Department doesn't belong to organization",
        };
      }

      // get the organization with the id of organizationId
      const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
      });

      const userId = existingUser.id;

      console.log({ userId: userId });

      // add the user to the department
      const userDepartment = await userService.addUserToDepartment(
        userId,
        departmentId
      );

      // add the user to the organization
      const userOrganization = await userService.addUserToOrganization(
        userId,
        organizationId
      );

      // new data to update the user
      const newData = {
        userDepartmentRoles: {
          connect: { id: userDepartment.id },
        },
        userOrganizationRoles: {
          connect: { id: userOrganization.id },
        },
      };

      // get the updated user
      const updatedUser = await userService.updateUser(userId, newData);

      // Send invitation email
      const emailTokenData = {
        email: updatedUser.email,
        name: updatedUser.name,
        department: department.name,
        organization: organization.name,
      };

      const generateEmailToken = jwt.sign(
        emailTokenData,
        process.env.JWT_SECRET!
      );

      sendEmails.sendInviteEmailToExistingUser(generateEmailToken);
    } else {
      // generate random password
      const password = generateRandomPassword();

      const defaultPassword = password;
      const hashedPassword = await hashPassword(password);

      // check if the department exists
      const department = await prisma.department.findUnique({
        where: { id: departmentId },
      });

      if (!department) {
        throw { status: 400, message: "Department not found" };
      }

      // check if the department belongs to the organization
      if (department.organizationId !== organizationId) {
        throw {
          status: 400,
          message: "Department doesn't belong to organization",
        };
      }

      // get the name of the organization with the id of organizationId
      const organization = await prisma.organization.findFirst({
        where: { id: organizationId },
      });

      // create data for the user
      const data = {
        name,
        email,
        password: hashedPassword,
        userType: mappedUserType,
        isVerified: true,
        createdAt: new Date().toISOString(),
      };

      // Create the user along with user roles in a single transaction
      const user = await userService.createUser(data);

      // add user to Department
      const userId = user.id;

      const userDepartment = await userService.addUserToDepartment(
        userId,
        departmentId
      );

      // add the user to the organization
      const newUserOrganizationRole = await userService.addUserToOrganization(
        userId,
        organizationId
      );

      // get the updated user
      const updatedUser = await userService.updateUser(userId, {
        userDepartmentRoles: {
          connect: { id: userDepartment.id },
        },
        userOrganizationRoles: {
          connect: { id: newUserOrganizationRole.id },
        },
      });

      const emailTokenData = {
        email: user.email,
        name: user.name,
        password: defaultPassword,
        department: department.name,
        organization: organization?.name,
      };

      const generateEmailToken = jwt.sign(
        emailTokenData,
        process.env.JWT_SECRET!
      );
      // Send invitation email
      sendEmails.sendInviteEmail(generateEmailToken);

      return updatedUser;
    }
  } catch (error) {
    console.error("Error", error);
    throw { status: 400, message: "Failed to create invited user" };
  }
};

export default { inviteUser };
