import prisma from "../../../prisma/client";
import { UserType } from "@prisma/client";
import { hashPassword } from "../../../utils/hashPassword";
import generateRandomPassword from "../../../utils/generateRandonPassword";
import sendEmails from "../../../utils/sendEmails";
import jwt from "jsonwebtoken";
import mapStringToUserType from "../../../utils/mapStringToUserType";

const inviteUser = async (
  name: string,
  email: string,
  userType: UserType,
  userOrganizationRoles: string[],
  departmentName: string,
  organizationId: string
) => {
  if (
    !name ||
    !email ||
    !userType ||
    !userOrganizationRoles ||
    !departmentName
  ) {
    throw { status: 400, message: "Missing required fields" };
  }

  let mappedUserType: UserType;
  try {
    mappedUserType = mapStringToUserType(userType);
  } catch (error) {
    throw { status: 400, message: "Invalid user type" };
  }

  // generate random password
  const password = generateRandomPassword();

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw { status: 400, message: "Email already in use!" };
    }

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

    // get the deparmtnet id with the department name provided
    const department = await prisma.department.findFirst({
      where: { name: departmentName },
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
  } catch (error) {
    console.error("Error", error);
    throw { status: 400, message: "Failed to create invited user" };
  }
};

export default { inviteUser };
