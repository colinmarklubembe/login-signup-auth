import { Router, Request, Response } from "express";
import { PrismaClient, UserType } from "@prisma/client";
import { createInvitedUser } from "../../../utils/createUserAndAssignRole";
import generateRandomPassword from "../../../utils/generateRandonPassword";
import authenticateToken from "../../middleware/authenticate";

const router = Router();
const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: { organizationId: string };
}

// invite users
router.post(
  "/invite-user",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const { name, email, userType, userOrganizationRoles, departmentName } =
      req.body;

    const { organizationId } = req.user!;

    if (
      !name ||
      !email ||
      !userType ||
      !userOrganizationRoles ||
      !departmentName
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // check if user type is valid
    if (!Object.values(UserType).includes(userType)) {
      return res.status(400).json({ error: "Invalid user type" });
    }

    // generate random password
    const password = generateRandomPassword();

    // create user
    await createInvitedUser(
      name,
      email,
      password,
      userType,
      organizationId,
      userOrganizationRoles,
      departmentName,
      res
    );
  }
);

export default router;
