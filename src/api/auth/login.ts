import jwt from "jsonwebtoken";
import { Router } from "express";
import bcryptjs from "bcryptjs";
import rateLimit from "express-rate-limit";
import session from "express-session";
import { Session } from "express-session";
import prisma from "../../prisma/client";
import { LoginSession } from "../types/types";

const router = Router();

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

// interface LoginSession extends Session {
//   admin?: {
//     id: any;
//     name: string;
//     email: string;
//   };
//   user?: {
//     id: any;
//     name: string;
//     email: string;
//   };
// }

// login
router.post("/login", limiter, async (req, res) => {
  const { email, password } = req.body;

  // check if email exists in user or admin table
  const checkAdmin = await prisma.admin.findUnique({
    where: {
      email,
    },
  });
  if (!checkAdmin) {
    // if not in admin table, check in user table
    const checkUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!checkUser) {
      return res.status(400).json({ error: "Invalid Credentials" });
    } else {
      // check if user is verified
      if (checkUser.verified == false) {
        return res.status(400).json({ error: "User is not verified" });
      }
      // compare password
      const isMatch = await bcryptjs.compare(password, checkUser.password);

      if (!isMatch) {
        return res.status(400).json({ error: "Invalid credentials" });
      } else {
        // create a token to verify user
        // token data
        const tokenData = {
          id: checkUser.id,
          email: checkUser.email,
          name: checkUser.name,
          isAdmin: checkUser.isAdmin,
          isVerified: checkUser.isVerified,
          createdAt: new Date().toISOString(),
        };
        // create token
        const loginToken = jwt.sign(tokenData, process.env.JWT_SECRET!, {
          expiresIn: "1h",
        });
        console.log(loginToken);

        // start a session
        (req.session as LoginSession).user = {
          id: checkUser.id,
          name: checkUser.name,
          email: checkUser.email,
        };

        // store user in cookie
        res.cookie("user", checkUser.id, {
          maxAge: 24 * 60 * 60 * 1000,
          httpOnly: true,
          secure: true,
        });

        console.log(req.session);
        // send token
        res.json({
          message: "Logged in successfully as user",
          success: true,
          token: loginToken,
        });
      }
    }
  } else {
    if (checkAdmin.verified == false) {
      return res.status(400).json({ error: "Admin is not verified" });
    }
    // compare password
    const isMatch = await bcryptjs.compare(password, checkAdmin.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    } else {
      // create a token to verify user
      // token data
      const tokenData = {
        id: checkAdmin.id,
        email: checkAdmin.email,
        name: checkAdmin.name,
        isAdmin: checkAdmin.isAdmin,
        isVerified: checkAdmin.isVerified,
        createdAt: new Date().toISOString(),
      };
      // create token
      const loginToken = jwt.sign(tokenData, process.env.JWT_SECRET!, {
        expiresIn: "1h",
      });
      console.log(loginToken);
      // start a session
      (req.session as LoginSession).admin = {
        id: checkAdmin.id,
        name: checkAdmin.name,
        email: checkAdmin.email,
      };

      // store admin in cookie
      res.cookie("admin", checkAdmin.id, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: true,
      });

      console.log(req.session);
      // send token
      res.json({
        message: "Logged in successfully as admin",
        success: true,
        token: loginToken,
      });
    }
  }
});

// logout
router.get("/users/logout", async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.clearCookie("user");
    res.json({ message: "Logged out successfully", success: true });
  });
});

router.get("/admins/logout", async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.clearCookie("admin");
    res.json({ message: "Logged out successfully", success: true });
  });
});

export default router;
