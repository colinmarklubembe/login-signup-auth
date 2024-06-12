import { Router } from "express";
import { PrismaClient, UserType } from "@prisma/client";
import { createInvitedUser } from "../../../utils/createUserAndAssignRole";
import generateRandomPassword from "../../../utils/generateRandonPassword";

const router = Router();
const prisma = new PrismaClient();

// invite users
router.post("/invite-user", async (req, res) => {
  const { name, email, organizationId, userType, userOrganizationRoles } =
    req.body;

  if (
    !name ||
    !email ||
    !organizationId ||
    !userType ||
    !userOrganizationRoles
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // check if user type is valid
  if (!Object.values(UserType).includes(userType)) {
    return res.status(400).json({ error: "Invalid user type" });
  }

  // check if user already exists
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (user) {
    return res.status(400).json({ error: "User already exists" });
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
    res
  );
});

export default router;
