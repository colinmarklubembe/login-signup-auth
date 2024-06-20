import { Request, Response } from "express";
import inviteUserService from "../services/inviteUser";

interface AuthenticatedRequest extends Request {
  user?: { organizationId: string };
}

const inviteUser = async (req: AuthenticatedRequest, res: Response) => {
  const { departmentId } = req.params;
  const { name, email, userType, userOrganizationRoles } = req.body;

  const { organizationId } = req.user!;

  try {
    await inviteUserService.inviteUser(
      departmentId,
      name,
      email,
      userType,
      userOrganizationRoles,
      organizationId
    );
    res.status(200).json({
      message: "Invitation email sent successfully!",
      success: true,
    });
  } catch (error: any) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

export default { inviteUser };
