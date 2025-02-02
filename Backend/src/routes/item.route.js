import express from "express";
import {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
} from "../controllers/item.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Protected routes
router.route("/").get(verifyAccessToken, getAllItems); // Fetch all items
router.route("/:id").get(verifyAccessToken, getItemById); // Fetch specific item by ID

router
  .route("/")
  .post(verifyAccessToken, upload.array("images", 5), createItem); // Create new item
router
  .route("/:id")
  .put(verifyAccessToken, upload.array("images", 5), updateItem) // Update item details
  .delete(verifyAccessToken, deleteItem); // Delete item

export default router;
