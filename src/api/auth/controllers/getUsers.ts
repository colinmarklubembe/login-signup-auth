import { Request, Response } from "express";
import userService from "../../auth/services/userService";
import { organizationService } from "../../services";

interface AuthenticatedRequest extends Request {
  organization?: { organizationId: string };
}

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();

    res.status(200).json({ success: true, users: users });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = id;

    const user = await userService.findUserById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, error: "User does not exist" });
    }

    res.status(200).json({ success: true, user: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getUsersByOrganization = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { organizationId } = req.organization!;

    const organization = await organizationService.findOrganizationById(
      organizationId
    );

    if (!organization) {
      return res
        .status(404)
        .json({ success: false, error: "Organization does not exist" });
    }

    const users = await userService.findUsersByOrganization(organizationId);

    res
      .status(200)
      .json({ success: true, organization: organization.name, users: users });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export default { getAllUsers, getUserById, getUsersByOrganization };
