import { Request, Response, Router } from "express";
import prisma from "../../prisma/client";
import sendEmails from "../../utils/sendEmails";
import jwt from "jsonwebtoken";

const router = Router();

router.put("/update-profile", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User does not exist" });
    }

    if (!name) {
      return res
        .status(400)
        .send("Missing required fields for updating a user profile");
    }

    // send update profile email to user
    const emailTokenData = {
      email: user.email,
      name: user.name,
    };

    const generateEmailToken = jwt.sign(
      emailTokenData,
      process.env.JWT_SECRET!
    );
    // Send invitation email
    sendEmails.sendInviteEmail(generateEmailToken, res);

    const updatedUser = await prisma.user.update({
      where: {
        id,
      },
      data: {
        name,
        updatedAt: new Date().toISOString(),
      },
    });

    console.log("User updated successfully");
    res.status(200).json({ message: "Updated User:", updatedUser });
  } catch (error) {
    console.error("Error updating user", error);
    res.status(500).send("Error updating user");
  }
});

export default router;
