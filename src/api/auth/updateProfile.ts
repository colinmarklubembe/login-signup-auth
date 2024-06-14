import { Request, Response, Router } from "express";
import prisma from "../../prisma/client";

const router = Router();

router.put("/update-profile", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User does not exist" });
    }

    if (!name || !email || !password) {
      return res
        .status(400)
        .send("All fields are required for updating a user profile");
    }

    // send update profile email to user

    const updatedUser = await prisma.user.update({
      where: {
        id,
      },
      data: {
        name,
        email,
        password,
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
