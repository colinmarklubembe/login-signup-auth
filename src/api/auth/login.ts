import jwt from "jsonwebtoken";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import prisma from "../../prisma/client";
import { comparePassword } from "./utils/comparePassword";

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
        roles: {
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
    comparePassword(password, hashedPassword, res);

    // Fetch roles
    const roles = user.roles.map(
      (userRole: { role: { name: any } }) => userRole.role.name
    );

    // Create token data
    const tokenData = {
      id: user.id,
      email: user.email,
      name: user.name,
      userType: user.userType,
      isVerified: user.isVerified,
      roles,
      createdAt: new Date().toISOString(), // token
    };

    // Create token
    const loginToken = jwt.sign(tokenData, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    // Determine the user type message
    const userTypeMessage = user.userType.toLowerCase();

    res.json({
      message: `Logged in successfully as ${userTypeMessage}`,
      success: true,
      token: loginToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
