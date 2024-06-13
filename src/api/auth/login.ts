import jwt from "jsonwebtoken";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import prisma from "../../prisma/client";
import { comparePassword } from "../../utils/comparePassword";
import { generateToken } from "../../utils/generateToken";

const router = Router();

// Rate limiter middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: "Too many login attempts, please try again after 15 minutes",
});

// Login route with rate limiter applied
router.post("/login", limiter, async (req, res) => {
  const { email, password } = req.body;

  try {
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
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(400).json({ error: "User is not verified" });
    }

    const hashedPassword = user.password;

    // Compare passwords
    const isMatch = comparePassword(password, hashedPassword);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
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

    // Set the token in the Authorization header
    res.setHeader("Authorization", `Bearer ${loginToken}`);

    res.json({
      message: `Logged in successfully as ${user.userType.toLowerCase()}`,
      success: true,
      token: loginToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
