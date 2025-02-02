import express from "express";
import { addReview, getItemReviews, getSellerReviews, addSellerReview } from "../controllers/review.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";

const router = express.Router();


// Item Reveiws.....
router.route("/:id/reviews").get(verifyAccessToken, getItemReviews); // Fetch item reviews
router.route("/:id/reviews").post(verifyAccessToken, addReview); // Add item review
// router.route("/:id/reviews/:reviewId").delete(verifyAccessToken, deleteReview); // Delete item review
// router.route("/:id/reviews/:reviewId").put(verifyAccessToken, updateReview); // Update item review


// Seller Reviews.....
router.route("/seller/:id").get(verifyAccessToken, getSellerReviews); // Fetch seller reviews
router.route("/seller/:id").post(verifyAccessToken, addSellerReview); // Add seller review
// router.route("/:id/seller/:reviewId").delete(verifyAccessToken, deleteSellerReview); // Delete seller review
// router.route("/:id/seller/:reviewId").put(verifyAccessToken, updateSellerReview); // Update seller review

export default router;
