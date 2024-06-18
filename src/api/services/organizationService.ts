import prisma from "../../prisma/client";
import { generateToken } from "../../utils/generateToken";

const createOrganization = async (
  name: string,
  description: string,
  address: string,
  phoneNumber: string,
  organizationEmail: string,
  email: string
) => {
  // check if email exists in the database
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    include: {
      userOrganizationRoles: {
        include: {
          role: true, // Ensure roles are included
        },
      },
    },
  });

  if (!user) {
    throw { status: 404, message: "User not found" };
  }

  // check if the user type is an owner
  if (user.userType !== "OWNER") {
    throw {
      status: 403,
      message: "User is not authorized to create an organization",
    };
  }

  // check if user already has an organization with the same name
  const organization = await prisma.organization.findFirst({
    where: {
      name,
    },
  });

  if (organization) {
    throw {
      status: 400,
      message: "Organization with the same name already exists",
    };
  }
  const newOrganization = await prisma.organization.create({
    data: {
      name,
      description,
      address,
      phoneNumber,
      organizationEmail,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  });

  // fetch the role id of the owner
  const ownerRole = await prisma.role.findFirst({
    where: {
      name: "OWNER",
    },
  });

  if (!ownerRole) {
    throw { status: 500, message: "Role not found" };
  }

  // create UserOrganizationRole record
  await prisma.userOrganizationRole.create({
    data: {
      user: { connect: { id: user.id } },
      organization: { connect: { id: newOrganization.id } },
      role: { connect: { id: ownerRole.id } },
    },
  });

  // get all user organization roles
  const userOrganizationRoles = await prisma.userOrganizationRole.findMany({
    where: {
      userId: user.id,
    },
    include: {
      role: true,
    },
  });

  const roles = userOrganizationRoles.map(
    (userOrganizationRole: any) => userOrganizationRole.role?.name || "Unknown"
  );

  // create a new token of the user with the updated organizationId
  const tokenData = {
    id: user.id,
    email: user.email,
    name: user.name,
    userType: user.userType,
    isVerified: user.isVerified,
    organizationId: newOrganization.id,
    organizations: user.userOrganizationRoles.map((userOrgRole: any) => ({
      organizationId: userOrgRole.organizationId,
    })),
    roles,
    createdAt: new Date().toISOString(), // Store the token creation date
  };

  // create a new token
  const newToken = generateToken(tokenData);

  return { newOrganization, newToken };
};

const updateOrganization = async (
  id: string,
  name: string,
  description: string,
  address: string,
  phoneNumber: string,
  organizationEmail: string
) => {
  // check if the organization exists in the database
  const organization = await prisma.organization.findUnique({
    where: {
      id,
    },
  });

  if (!organization) {
    throw { status: 404, message: "Organization does not exist" };
  }

  if (!name) {
    throw { status: 400, message: "Organization name is required" };
  }
  return prisma.organization.update({
    where: {
      id,
    },
    data: {
      name,
      description,
      address,
      phoneNumber,
      organizationEmail,
      updatedAt: new Date().toISOString(),
    },
  });
};

const getOrganizationById = async (organizationId: string) => {
  return prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
  });
};

const getAllOrganizations = async () => {
  return prisma.organization.findMany();
};

const deleteOrganization = async (id: string, email: string) => {
  // check if email exists in the database
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw { status: 404, message: "User not found" };
  }

  // check if the user type is an owner
  if (user.userType !== "OWNER") {
    throw {
      status: 403,
      message: "User is not authorized to delete an organization",
    };
  }

  // Check if the organization exists
  const organization = await prisma.organization.findUnique({
    where: {
      id,
    },
  });

  if (!organization) {
    throw { status: 404, message: "Organization not found" };
  }

  // Perform deletion
  const deletedOrganization = await prisma.organization.delete({
    where: {
      id,
    },
  });

  return deletedOrganization;
};

const selectOrganization = async (organizationName: string, email: string) => {
  // Get the organization ID based on organizationName
  const organization = await prisma.organization.findFirst({
    where: {
      name: organizationName,
    },
  });

  if (!organization) {
    throw { status: 404, message: "Organization not found" };
  }

  const organizationId = organization.id;

  // check if email exists in the database
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    include: {
      userOrganizationRoles: {
        include: {
          role: true, // Ensure roles are included
        },
      },
    },
  });

  if (!user) {
    throw { status: 404, message: "User not found" };
  }

  // Check if the user belongs to the selected organization
  const userOrganization = user.userOrganizationRoles.find(
    (userOrgRole: any) => userOrgRole.organizationId === organizationId
  );

  if (!userOrganization) {
    throw {
      status: 403,
      message: "User does not belong to the selected organization",
    };
  }

  const roles = user.userOrganizationRoles.map(
    (userOrganizationRole: any) => userOrganizationRole.role?.name || "Unknown"
  );

  // create a new token of the user with the updated organizationId
  const tokenData = {
    id: user.id,
    email: user.email,
    name: user.name,
    userType: user.userType,
    isVerified: user.isVerified,
    organizationId: organizationId,
    organizations: user.userOrganizationRoles.map((userOrgRole: any) => ({
      organizationId: userOrgRole.organizationId,
    })),
    roles,
    createdAt: new Date().toISOString(), // Store the token creation date
  };

  // generate new token
  const newToken = generateToken(tokenData);

  return { organization, newToken };
};

const getUserOrganizations = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    include: {
      userOrganizationRoles: true,
    },
  });

  if (!user) {
    throw { status: 404, message: "User not found" };
  }

  const organizations = user.userOrganizationRoles.map((userOrgRole: any) => ({
    organizationId: userOrgRole.organizationId,
  }));

  // check the organization table for the organization name matching the organizationId
  const organizationNames = await Promise.all(
    organizations.map(async (org: any) => {
      const organization = await prisma.organization.findUnique({
        where: {
          id: org.organizationId,
        },
      });

      return organization;
    })
  );

  return organizationNames;
};

export default {
  createOrganization,
  updateOrganization,
  getOrganizationById,
  getAllOrganizations,
  deleteOrganization,
  selectOrganization,
  getUserOrganizations,
};
