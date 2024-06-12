import { Router, Request, Response } from "express";
// import { verifyRefreshTokenMiddleware } from "../middleware/authenticateRefreshToken";
import jwt from "jsonwebtoken";
import prisma from "../../prisma/client";
import authenticateToken from "../middleware/authenticate";

const router = Router();

interface AuthenticatedRequest extends Request {
  user?: any;
}

router.get(
  "/refresh-token",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    console.log("Refresh token route hit");
    try {
      // Fetch the latest user data from the database
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          userOrganizationRoles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!user) {
        console.log("User not found for given token");
        return res.status(400).json({ error: "Invalid token" });
      }

      // Fetch roles
      const roles = user.userOrganizationRoles.map(
        (userOrganizationRole: any) => userOrganizationRole.role.name
      );

      const organizationId =
        user.userOrganizationRoles.length > 0
          ? user.userOrganizationRoles[0].organizationId
          : null;

      // Create new token data with updated information
      const newTokenData = {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        isVerified: user.isVerified,
        organizationId: organizationId,
        roles,
        createdAt: new Date().toISOString(), // Store the token creation date
      };

      // Create a new token
      const newToken = jwt.sign(newTokenData, process.env.JWT_SECRET!, {
        expiresIn: "1h", // Set token expiration time
      });

      res.setHeader("Authorization", `Bearer ${newToken}`);

      console.log("New token generated:", newToken);

      res.json({
        message: "Token refreshed successfully",
        success: true,
        token: newToken,
      });
    } catch (error) {
      console.error("Error in refresh token route:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
