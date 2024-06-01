import express from "express";
import mongoose from "mongoose";
import userSignUpRouter from "./api/User/signup/userSignUp";
import adminSignUpRouter from "./api/admin/signup/adminSignUp";
import adminLoginRouter from "./api/admin/login/adminLogin";
import userLoginRouter from "./api/User/login/userLogin";
import adminForgotPassWordRouter from "./api/admin/changePassword/forgotPassword";
import adminChangePasswordRouter from "./api/admin/changePassword/changePassword";
import userForgotPasswordRouter from "./api/User/changePassword/forgotPassword";
import userChangePasswordRouter from "./api/User/changePassword/changePassword";

const app = express();
const port = process.env.PORT || 4000;

mongoose
  .connect(process.env.DATABASE_URL!)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

app.use(express.json());

app.use(
  "/api_user",
  userSignUpRouter,
  userLoginRouter,
  userForgotPasswordRouter,
  userChangePasswordRouter
);
app.use(
  "/api_admin",
  adminSignUpRouter,
  adminLoginRouter,
  adminForgotPassWordRouter,
  adminChangePasswordRouter
);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
