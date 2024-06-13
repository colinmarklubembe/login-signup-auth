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
import productRouter from "./api/routes/productRoutes";

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

app.use("/api/v1/auth", ownerSignupRouter);
app.use("/api/v1/auth", verifyUserRouter);
app.use("/api/v1/users", forgotPasswordRouter);
app.use("/api/v1/users", changePasswordRouter);
app.use("/api/v1/auth", loginRouter);
app.use("/api/v1/organizations", organizationRouter);
app.use("/api/v1/users", inviteUserRouter);
app.use("/api/v1/departments", departmentRouter);
app.use("/ap1/v1/tokens", refreshTokenRouter);
app.use("/api/v1/products", productRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
