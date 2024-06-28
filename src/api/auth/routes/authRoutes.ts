import { Router } from "express";

import {
  signupController,
  verifyUserController,
  loginController,
  changePasswordController,
  forgotPasswordController,
  inviteUserController,
  updateProfileController,
  getUserController,
  deleteUserController,
} from "../controllers";

import {
  authenticate,
  checkMissingFields,
  loginLimiter,
} from "../../middleware";

const router = Router();

router.post(
  "/signup",
  checkMissingFields(["name", "email", "password"]),
  signupController.signup
);

router.get("/verify", verifyUserController.verifyUser);

router.post(
  "/reverify",
  checkMissingFields(["email"]),
  verifyUserController.reverifyUser
);

router.post(
  "/login",
  loginLimiter,
  checkMissingFields(["email", "password"]),
  loginController.login
);

router.put(
  "/change-password/:id",
  checkMissingFields(["oldPassword", "newPassword"]),
  changePasswordController.changePassword
);

router.put(
  "/reset-password/:id",
  checkMissingFields(["newPassword"]),
  changePasswordController.resetPassword
);

router.post(
  "/forgot-password",
  checkMissingFields(["email"]),
  forgotPasswordController.forgotPassword
);

router.post(
  "/invite-user/:departmentId",
  checkMissingFields(["name", "email", "userType"]),
  authenticate.checkOrganizationId,
  inviteUserController.inviteUser
);

router.put(
  "/update-profile/:id",
  checkMissingFields(["name", "email"]),
  updateProfileController.updateProfile
);

router.get("/get-user/:id", getUserController.getUserById);

router.get("/get-users", getUserController.getAllUsers);

router.delete("/delete-user/:id", deleteUserController.deleteUser);

export default router;
