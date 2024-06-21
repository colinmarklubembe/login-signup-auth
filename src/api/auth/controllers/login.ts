import { Request, Response } from "express";
import userService from "../services/userService";
import comparePassword from "../../../utils/comparePassword";
import organizationService from "../../services/organizationService";
import generateToken from "../../../utils/generateToken";

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await userService.findUserByEmail(email);

    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(400).json({ message: "User is not verified" });
    }

    const hashedPassword = user.password;

    // Compare passwords
    const isMatch = comparePassword.comparePassword(password, hashedPassword);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Fetch organization IDs of the user
    const userOrganizationIds = await organizationService.fetchOrganizationIds(
      user
    );

    const organizationIds = userOrganizationIds;

    const organizations = await organizationService.getUserOrganizationz(
      organizationIds
    );

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
    // Set the token in the Authorization header
    res.setHeader("Authorization", `Bearer ${loginToken}`);

    res.status(200).json({
      message: `Logged in successfully as ${tokenData.name}`,
      success: true,
      user: tokenData,
      token: loginToken,
    });
  } catch (error: any) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

export default { login };
