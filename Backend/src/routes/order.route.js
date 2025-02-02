import { Router } from "express";
import {
  placeOrder,
  getOrders,
  getOrderById,
  closeOrder,
  getOrdersToDeliver,
  verifyAndDeliverOrder,
  getOrderAsBuyer,
  getOrderAsSeller,
} from "../controllers/order.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Specific routes first
router.get("/deliver", verifyAccessToken, getOrdersToDeliver);
router.get("/my-orders", verifyAccessToken, getOrders);

// Parameterized routes last
router.get("/:id", verifyAccessToken, getOrderById);
router.post("/", verifyAccessToken, placeOrder);
router.post("/close", verifyAccessToken, closeOrder);
router.post("/verify-delivery", verifyAccessToken, verifyAndDeliverOrder);
router.get("/buyer/:id", verifyAccessToken, getOrderAsBuyer);
router.get("/seller/:id", verifyAccessToken, getOrderAsSeller);

export default router;
