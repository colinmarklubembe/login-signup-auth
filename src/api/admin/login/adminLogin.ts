import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";
import rateLimit from "express-rate-limit";
import session from "express-session";

const router = Router();
const prisma = new PrismaClient();

// rate limiter middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 100 requests
  message: "Too many login attempts, please try again after 15 minutes",
});

router.use(limiter);

// session middleware
router.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: true,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

//admin login
router.get("/admin/login", limiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // check if admin exists in the database
    const admin = await prisma.admin.findUnique({
      where: {
        email,
      },
    });

    if (!admin) {
      return res.status(400).json({ error: "Admin does not exist" });
    } else {
      // compare password
      const isMatch = await bcryptjs.compare(password, admin.password);

      if (!isMatch) {
        // increment login attempts

        return res.status(400).json({ error: "Invalid credentials" });
      } else {
        res.json({ message: "Login successful", success: true });

        // start a session
      }
    }
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

export default router;
