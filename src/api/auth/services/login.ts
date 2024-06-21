import prisma from "../../../prisma/client";
import { comparePassword } from "../../../utils/comparePassword";
import generateToken from "../../../utils/generateToken";

const login = async (email: string, password: string) => {
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      userOrganizations: {
        include: {
          organization: true,
        },
      },
      userDepartments: {
        include: {
          department: {
            include: {
              organization: true,
            },
          },
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

  // Fetch organization IDs of the user
  const organizationIds = user.userOrganizations.map(
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

  const organizationId =
    user.userOrganizations.length === 1
      ? user.userOrganizations[0].organizationId
      : null;

  // Create token data
  const tokenData = {
    id: user.id,
    email: user.email,
    name: user.name,
    userType: user.userType,
    isVerified: user.isVerified,
    organizations: organizationDetails,
    organizationId: organizationId,
    createdAt: new Date().toISOString(), // temporarily store the token creation date
  };

  // Create token
  const loginToken = generateToken.generateToken(tokenData);
  return { loginToken, user, tokenData };
};

export default { login };
