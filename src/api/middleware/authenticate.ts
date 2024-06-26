import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthenticatedRequest extends Request {
  user?: { email: string };
  organization?: { organizationId: string };
}

const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
    if (err) return res.sendStatus(403);

    req.user = user as { email: string; organizationId: string };
    next();
  });
};

const checkOrganizationId = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const organizationId = req.headers["organization-id"];

  if (!organizationId) {
    return res.status(404).json({
      success: false,
      error: "Organization ID is missing from the headers",
    });
  }

  req.organization = { organizationId: organizationId as string };
  next();
};

export default { authenticateToken, checkOrganizationId };
