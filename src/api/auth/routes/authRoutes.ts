import { Router } from "express";
import { limiter } from "../middleware/limiter";
import signupController from "../controllers/signup";
import verifyUserController from "../controllers/verifyUser";
import loginController from "../controllers/login";
import changePasswordController from "../controllers/changePassword";
import deleteUserController from "../controllers/deleteUser";
import forgotPasswordController from "../controllers/forgotPassword";
import inviteUserController from "../controllers/inviteUser";
import updateProfileController from "../controllers/updateProfile";
import authenticateToken from "../../middleware/authenticate";
import checkMissingFields from "../middleware/checkMissingFields";

const router = Router();

router.post(
  "/signup",
  checkMissingFields(["name", "email", "password"]),
  signupController.ownerSignup
);

router.get("/verify", verifyUserController.verifyUser);

router.post(
  "/reverify",
  checkMissingFields(["email"]),
  verifyUserController.reverifyUser
);

router.post(
  "/login",
  limiter,
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
  "/inviter-user",
  checkMissingFields([
    "name",
    "email",
    "userType",
    "userOrganizationRoles",
    "departmentName",
  ]),
  authenticateToken,
  inviteUserController.inviteUser
);

router.put(
  "/update-profile/:id",
  checkMissingFields(["name", "email"]),
  updateProfileController.updateProfile
);

router.delete("/delete-user/:id", deleteUserController.deleteUser);

export default router;
