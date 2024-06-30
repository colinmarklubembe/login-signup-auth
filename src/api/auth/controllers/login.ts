import { Request, Response } from "express";
import { organizationService } from "../../services";
import { comparePassword, generateToken } from "../../../utils";
import userService from "../services/userService";

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await userService.findUserByEmail(email);

    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    //check if user is active
    if (!user.isActivated) {
      const userId = user.id;
      const newData = {
        isActivated: true,
      };

      const activateUser = await userService.updateUser(userId, newData);
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

    // update the user's organizationId
    const userId = user.id;
    const newData = {
      organizationId: organizationId,
    };

    await userService.updateUser(userId, newData);

    // Create token data
    const tokenData = {
      id: user.id,
      email: user.email,
      name: user.name,
      userType: user.userType,
      isVerified: user.isVerified,
      createdAt: new Date().toISOString(), // temporarily store the token creation date
    };

    // get the updated user
    const updatedUser = await userService.findUserById(user.id);

    // Create token
    const loginToken = generateToken.generateToken(tokenData);

    res
      .status(200)
      .setHeader("Authorization", `Bearer ${loginToken}`)
      .json({
        message: `Logged in successfully as ${tokenData.name}`,
        success: true,
        user: updatedUser,
        token: loginToken,
      });
  } catch (error: any) {
    res.json({ message: error.message });
  }
};

export default { login };
