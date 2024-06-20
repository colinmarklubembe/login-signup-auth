import prisma from "../../../prisma/client";
import { UserType } from "@prisma/client";
import { hashPassword } from "../../../utils/hashPassword";
import generateRandomPassword from "../../../utils/generateRandonPassword";
import sendEmails from "../../../utils/sendEmails";
import jwt from "jsonwebtoken";
import mapStringToUserType from "../../../utils/mapStringToUserType";

const inviteUser = async (
  departmentId: string,
  name: string,
  email: string,
  userType: UserType,
  userOrganizationRoles: string[],
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
    const existingUser = await prisma.user.findUnique({ where: { email } });
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
        where: { name: { in: userOrganizationRoles } },
      });

      // Validate roles
      if (roleEntities.length !== userOrganizationRoles.length) {
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
      const organization = await prisma.organization.findFirst({
        where: { id: organizationId },
      });

      // add the user to the department with the departmentId
      await prisma.userDepartment.create({
        data: {
          userId: existingUser.id,
          departmentId: department.id,
        },
      });

      // add the user organization roles
      const existingUserOrganizationRoles =
        await prisma.userOrganizationRole.createMany({
          data: roleEntities.map((role: any) => ({
            userId: existingUser.id,
            organizationId: organizationId,
            roleId: role.id,
          })),
        });

      // update the user in the database
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          userOrganizationRoles: existingUserOrganizationRoles,
        },
      });

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
        where: { name: { in: userOrganizationRoles } },
      });

      // Validate roles
      if (roleEntities.length !== userOrganizationRoles.length) {
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

      // Create the user along with user roles in a single transaction
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          userType: mappedUserType,
          isVerified: true,
          createdAt: new Date().toISOString(),
          userOrganizationRoles: {
            create: roleEntities.map((role: any) => ({
              organization: {
                connect: { id: organizationId },
              },
              role: {
                connect: { id: role.id },
              },
            })),
          },
        },
        include: {
          userOrganizationRoles: {
            include: {
              role: true,
            },
          },
        },
      });

      // add user to Department
      const userDepartment = await prisma.userDepartment.create({
        data: {
          userId: user.id,
          departmentId: department.id,
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
    }
  } catch (error) {
    console.error("Error", error);
    throw { status: 400, message: "Failed to create invited user" };
  }
};

export default { inviteUser };
