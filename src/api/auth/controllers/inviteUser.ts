import { UserType } from "@prisma/client";
import { Request, Response } from "express";
import {
  mapStringToUserType,
  sendEmails,
  generateRandomPassword,
  hashPassword,
  systemLog,
} from "../../../utils";
import { departmentService, organizationService } from "../../services";
import userService from "../services/userService";

interface AuthenticatedRequest extends Request {
  organization?: { organizationId: string };
}

const inviteUser = async (req: AuthenticatedRequest, res: Response) => {
  const { departmentId } = req.params;
  const { name, email, userType } = req.body;

  const { organizationId } = req.organization!;

  try {
    let mappedUserType: UserType;

    mappedUserType = mapStringToUserType(userType);

    // Check if user already exists
    const existingUser = await userService.findUserByEmail(email);

    if (existingUser) {
      const department = await departmentService.findDepartmentById(
        departmentId
      );

      if (!department) {
        return res
          .status(400)
          .json({ success: false, error: "Department not found" });
      }

      // check if the department belongs to the organization
      if (department.organizationId !== organizationId) {
        res.status(400).json({
          success: false,
          error: "Department doesn't belong to organization",
        });
      }

      // get the organization with the id of organizationId
      const organization = await organizationService.findOrganizationById(
        organizationId
      );

      const userId = existingUser.id;

      // add the user to the department
      const userDepartment = await userService.addUserToDepartment(
        userId,
        departmentId
      );

      // add the user to the organization if the user is not already in the organization
      const userOrganization = await userService.findUserOrganization(
        userId,
        organizationId
      );

      if (!userOrganization) {
        return await userService.addUserToOrganization(userId, organizationId);
      }

      // new data to update the user
      const newData = {
        userDepartments: {
          connect: { id: userDepartment.id },
        },
        userOrganizations: {
          connect: { id: userOrganization.id },
        },
      };

      // get the updated user
      const updatedUser = await userService.updateUser(userId, newData);

      // Send invitation email
      const emailData = {
        email: updatedUser.email,
        name: updatedUser.name,
        department: department.name,
        organization: organization.name,
      };

      const response = await sendEmails.sendInviteEmailToExistingUser(
        emailData
      );

      return res.status(200).json({
        message: "Invitation email sent successfully!",
        success: true,
        user: updatedUser,
      });
    } else {
      // generate random password
      const password = generateRandomPassword();

      const defaultPassword = password;
      const hashedPassword = await hashPassword(password);

      // check if the department exists
      const department = await departmentService.findDepartmentById(
        departmentId
      );

      if (!department) {
        return res
          .status(400)
          .json({ success: false, error: "Department not found" });
      }

      // check if the department belongs to the organization
      if (department.organizationId !== organizationId) {
        res.status(400).json({
          success: false,
          error: "Department doesn't belong to organization",
        });
      }

      // get the name of the organization with the id of organizationId
      const organization = await organizationService.findOrganizationById(
        organizationId
      );

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
      const newUserOrganization = await userService.addUserToOrganization(
        userId,
        organizationId
      );

      // get the updated user
      const updatedUser = await userService.updateUser(userId, {
        userDepartments: {
          connect: { id: userDepartment.id },
        },
        userOrganizations: {
          connect: { id: newUserOrganization.id },
        },
      });

      const emailData = {
        email: user.email,
        name: user.name,
        password: defaultPassword,
        department: department.name,
        organization: organization?.name,
      };

      // Send invitation email
      const response = await sendEmails.sendInviteEmail(emailData);

      systemLog.systemError(response.message);

      return res.status(200).json({
        message: "Invitation email sent successfully!",
        success: true,
        user: updatedUser,
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export default { inviteUser };
