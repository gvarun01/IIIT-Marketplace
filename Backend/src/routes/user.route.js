import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getUserProfile,
  updateUserProfile,
  updateUserAvatar,
  deleteUser,
  getSellerProfile,
  changePassword,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
const router = Router();

// routes declaration
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/refresh-token").get(refreshAccessToken);

// protected routes
router.route("/logout").post(verifyAccessToken, logoutUser);
router.route("/update-password").put(verifyAccessToken, changePassword);
router.route("/me").get(verifyAccessToken, getUserProfile);
router.route("/me").put(verifyAccessToken, updateUserProfile);
router.route("/avatar").put(verifyAccessToken,upload.single('avatar'), updateUserAvatar);
router.route("/me").delete(verifyAccessToken, deleteUser);
router.route("/:id").get(verifyAccessToken, getSellerProfile);



export default router;
