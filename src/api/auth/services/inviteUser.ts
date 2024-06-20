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
  Roles: string[],
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

      // Find roles
      const roleEntities = await prisma.role.findMany({
        where: { name: { in: Roles } },
      });

      // Validate roles
      if (roleEntities.length !== Roles.length) {
        throw { status: 400, message: "One or more roles are invalid" };
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
      const roleId = roleEntities[0].id;

      console.log({ userId: userId }, { roleId: roleId });

      // add the user to the department
      await userService.addUserToDepartment(userId, roleId);

      // assign role to the user
      const userDepartmentRole = await userService.assignRoleToUser(
        userId,
        roleId,
        departmentId
      );

      // new data to update the user
      const newData = {
        userDepartmentRoles: {
          connect: { id: userDepartmentRole.id },
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

      // Find roles
      const roleEntities = await prisma.role.findMany({
        where: { name: { in: Roles } },
      });

      // Validate roles
      if (roleEntities.length !== Roles.length) {
        throw { status: 400, message: "One or more roles are invalid" };
      }

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

      // add user to Department with role
      const roleId = roleEntities[0].id;
      const userId = user.id;

      const userDepartmentRole = await userService.addUserToDepartmentWithRole(
        userId,
        departmentId,
        roleId
      );

      // get the updated user
      const updatedUser = await userService.updateUser(userId, {
        userDepartmentRole: {
          connect: { id: userDepartmentRole.id },
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
