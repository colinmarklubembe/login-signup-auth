import { Router } from "express";
import { limiter } from "../../../utils/limiter";
import signupController from "../controllers/signup";
import verifyUserController from "../controllers/verifyUser";
import loginController from "../controllers/login";
import changePasswordController from "../controllers/changePassword";
import deleteUserController from "../controllers/deleteUser";
import forgotPasswordController from "../controllers/forgotPassword";
import inviteUserController from "../controllers/inviteUser";
import updateProfileController from "../controllers/updateProfile";
import authenticateToken from "../../middleware/authenticate";

const router = Router();

router.post("/signup", signupController.ownerSignup);

router.get("/verify", verifyUserController.verifyUser);

router.post("/login", limiter, loginController.login);

router.put("/change-password/:id", changePasswordController.changePassword);

router.put("/reset-password/:id", changePasswordController.resetPassword);

router.post("/forgot-password", forgotPasswordController.forgotPassword);

router.post(
  "/inviter-user",
  authenticateToken,
  inviteUserController.inviteUser
);

router.put("/update-profile/:id", updateProfileController.updateProfile);

router.delete("/delete-user/:id", deleteUserController.deleteUser);

export default router;
