import express from "express";
import {
  addToCart,
  getCart,
  removeFromCart,
  clearCart,
  updateCartQuantity,
  getCartCount,
} from "../controllers/cart.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Protected routes
router.route("/").post(verifyAccessToken, addToCart);
router.route("/").get(verifyAccessToken, getCart);
router.route("/").delete(verifyAccessToken, clearCart);
router.route("/:id").put(verifyAccessToken, updateCartQuantity);
router.route("/:id").delete(verifyAccessToken, removeFromCart);
router.route("/count").get(verifyAccessToken, getCartCount);

export default router;
