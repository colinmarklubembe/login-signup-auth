import prisma from "../../prisma/client";
import generateToken from "../../utils/generateToken";

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
      userOrganizations: {
        include: {
          organization: true,
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

  // create UserOrganization record
  await prisma.userOrganization.create({
    data: {
      user: { connect: { id: user.id } },
      organization: { connect: { id: newOrganization.id } },
    },
  });

  // Refetch the user's organizations to include the newly created one
  const updatedUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      userOrganizations: {
        include: {
          organization: true,
        },
      },
    },
  });

  // Fetch organization IDs of the user
  const organizationIds = updatedUser.userOrganizations.map(
    (userOrg: any) => userOrg.organizationId
  );

  const organizations = await prisma.organization.findMany({
    where: {
      id: {
        in: organizationIds,
      },
    },
  });

  // Map organization IDs to names
  const organizationMap = organizations.reduce((acc: any, org: any) => {
    acc[org.id] = org.name;
    return acc;
  }, {});

  const organizationDetails = organizations.map((org: any) => ({
    organizationId: org.id,
    organizationName: org.name,
  }));

  // create a new token of the user with the updated organizationId
  const tokenData = {
    id: updatedUser.id,
    email: updatedUser.email,
    name: updatedUser.name,
    userType: updatedUser.userType,
    isVerified: updatedUser.isVerified,
    organizations: organizationDetails,
    organizationId: newOrganization.id,
    createdAt: new Date().toISOString(), // Store the token creation date
  };

  // create a new token
  const newToken = generateToken.generateToken(tokenData);

  return { newOrganization, newToken, tokenData };
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
      userOrganizations: {
        include: {
          organization: true,
        },
      },
    },
  });

  if (!user) {
    throw { status: 404, message: "User not found" };
  }

  // Check if the user belongs to the selected organization
  const userOrganization = user.userOrganizations.find(
    (userOrg: any) => userOrg.organizationId === organizationId
  );

  const organizationIds = user.userOrganizations.map(
    (userOrg: any) => userOrg.organizationId
  );

  if (!userOrganization) {
    throw {
      status: 403,
      message: "User does not belong to the selected organization",
    };
  }

  const organizations = await prisma.organization.findMany({
    where: {
      id: {
        in: organizationIds,
      },
    },
  });

  // Map organization IDs to names
  const organizationMap = organizations.reduce((acc: any, org: any) => {
    acc[org.id] = org.name;
    return acc;
  }, {});

  const organizationDetails = organizations.map((org: any) => ({
    organizationId: org.id,
    organizationName: org.name,
  }));

  // create a new token of the user with the updated organizationId
  const tokenData = {
    id: user.id,
    email: user.email,
    name: user.name,
    userType: user.userType,
    isVerified: user.isVerified,
    organizationId: organizationId,
    organizations: organizationDetails,
    createdAt: new Date().toISOString(), // Store the token creation date
  };

  // generate new token
  const newToken = generateToken.generateToken(tokenData);

  return { organization, newToken };
};

const getUserOrganizations = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    include: {
      userOrganizations: true,
    },
  });

  if (!user) {
    throw { status: 404, message: "User not found" };
  }

  const organizations = user.userOrganizations.map((userOrg: any) => ({
    organizationId: userOrg.organizationId,
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

const fetchOrganizationIds = async (user: any) => {
  return user.userOrganizations.map((userOrg: any) => userOrg.organizationId);
};

const getUserOrganizationz = async (organizationIds: string[]) => {
  return prisma.organization.findMany({
    where: {
      id: {
        in: organizationIds,
      },
    },
  });
};

const findOrganizationById = async (organizationId: string) => {
  return prisma.organization.findUnique({
    where: { id: organizationId },
  });
};

export default {
  createOrganization,
  updateOrganization,
  getOrganizationById,
  getAllOrganizations,
  deleteOrganization,
  selectOrganization,
  getUserOrganizations,
  fetchOrganizationIds,
  getUserOrganizationz,
  findOrganizationById,
};
