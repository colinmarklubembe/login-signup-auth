import express from "express";
import mongoose from "mongoose";
import forgotPasswordRouter from "./api/auth/forgotPassword";
import changePasswordRouter from "./api/auth/changePassword";
import organizationRouter from "./api/routes/organizationRoutes";
import departmentRouter from "./api/routes/departmentRoutes";
import loginRouter from "./api/auth/login";
import ownerSignupRouter from "./api/auth/owner/signup";
import userSignupRouter from "./api/auth/User/signup";
import adminSignupRouter from "./api/auth/admin/signup";
import verifyUserRouter from "./api/auth/verifyUser";
import inviteUserRouter from "./api/auth/owner/inviteUsers";
import refreshTokenRouter from "./api/auth/refreshToken";

const cors = require("cors");
const app = express();

app.use(cors());

app.use(cors({ origin: "http://localhost:3000" }));

const port = process.env.PORT || 4000;

mongoose
  .connect(process.env.DATABASE_URL!)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

app.use(express.json());

// new routes for signup
app.use("/auth/api_owner", ownerSignupRouter);
app.use("/auth/api_user", userSignupRouter);
app.use("/auth/api_admin", adminSignupRouter);
app.use("/auth/api_verify", verifyUserRouter);

// new routes for password change
app.use("/auth/api", forgotPasswordRouter);
app.use("/auth/api", changePasswordRouter);

app.use("/auth/api_login", loginRouter);
app.use("/api_organization", organizationRouter);
app.use("/auth/api_invite", inviteUserRouter);
app.use("/api_department", departmentRouter);
app.use("/auth/api_refresh", refreshTokenRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
