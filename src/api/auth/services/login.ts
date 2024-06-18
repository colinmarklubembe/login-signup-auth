import prisma from "../../../prisma/client";
import { comparePassword } from "../../../utils/comparePassword";
import { generateToken } from "../../../utils/generateToken";

const login = async (email: string, password: string) => {
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      userOrganizationRoles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!user) {
    throw { status: 400, message: "No user found" };
  }

  // Check if user is verified
  if (!user.isVerified) {
    throw { status: 400, message: "User is not verified" };
  }

  const hashedPassword = user.password;

  // Compare passwords
  const isMatch = comparePassword(password, hashedPassword);

  if (!isMatch) {
    throw { status: 400, message: "Invalid credentials" };
  }

  // get all user organization roles
  const userOrganizationRoles = await prisma.userOrganizationRole.findMany({
    where: {
      userId: user.id,
    },
    include: {
      role: true,
    },
  });

  // Fetch roles
  const roles = user.userOrganizationRoles.map(
    (userOrganizationRole: any) => userOrganizationRole.role.name
  );

  const organizationId =
    user.userOrganizationRoles.length > 0
      ? user.userOrganizationRoles[0].organizationId
      : null;

  // Create token data
  const tokenData = {
    id: user.id,
    email: user.email,
    name: user.name,
    userType: user.userType,
    isVerified: user.isVerified,
    organizations: user.userOrganizationRoles.map((userOrgRole: any) => ({
      organizationId: userOrgRole.organizationId,
    })),
    organizationId: organizationId,
    roles,
    createdAt: new Date().toISOString(), // temporarily store the token creation date
  };

  // Create token
  const loginToken = generateToken(tokenData);
  return { loginToken, user };
};

export default { login };
