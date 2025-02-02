import { asyncHandler } from "../utils/asyncHandler.js";
import Item from "../models/item.model.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Add a review to an item
// /api/item/:id/review	(POST)
const addReview = asyncHandler(async (req, res) => {
  const { id } = req.params; // Item ID
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be between 1 and 5.");
  }

  const item = await Item.findById(id);
  if (!item) {
    throw new ApiError(404, "Item not found.");
  }

  // Add the review to the item
  item.reviews.push({
    reviewer: req.user._id,
    rating,
    comment,
  });

  // Update aggregate stats
  const totalReviews = item.reviews.length;
  const averageRating =
    item.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;

  item.averageRating = averageRating;
  item.totalReviews = totalReviews;

  await item.save();

  res
    .status(201)
    .json(new ApiResponse(201, item.reviews, "Review added successfully."));
});

// Fetch reviews for an item
// /api/item/:id/reviews	(GET)
const getItemReviews = asyncHandler(async (req, res) => {
  const { id } = req.params; // Item ID
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const skip = (page - 1) * limit;

  const item = await Item.findById(id).populate(
    "reviews.reviewer",
    "firstName lastName"
  );

  if (!item) {
    throw new ApiError(404, "Item not found.");
  }

  const reviews = item.reviews.slice(skip, skip + limit);
  const totalReviews = item.reviews.length;

  res.status(200).json({
    status: 200,
    data: reviews,
    totalReviews,
    totalPages: Math.ceil(totalReviews / limit),
    currentPage: page,
  });
});

const getSellerReviews = asyncHandler(async (req, res) => {
  const { id } = req.params; // Seller ID

  const seller = await User.findById(id)
    .select("-password -refreshToken")
    .populate({
      path: "reviews",
      populate: {
        path: "reviewer",
        select: "firstName lastName email"
      }
    });

    seller.rating = seller.reviews.reduce((sum, review) => sum + review.rating, 0) / seller.reviews.length;
    seller.totalReviews = seller.reviews.length;
    await seller.save();

  
  
  if (!seller) {
    throw new ApiError(404, "Seller not found.");
  }

  res.status(200)
    .json(new ApiResponse(200, seller.reviews, "Seller reviews fetched successfully."));
});

const addSellerReview = asyncHandler(async (req, res) => {
  const { id } = req.params; // Seller ID
  const { rating, comment } = req.body;

  console.log("Adding Reveiws",id, rating, comment);

  if (!rating || rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be between 1 and 5.");
  }

  const seller = await User.findById(id);
  if (!seller) {
    throw new ApiError(404, "Seller not found.");
  }

  // Add the review to the seller
  seller.reviews.push({
    reviewer: req.user._id,
    rating,
    comment,
  });

  // Update aggregate stats
  seller.totalReviews = seller.reviews.length;
  console.log("Total Reviews",seller.totalReviews);

  // Calculate new average rating
  const totalRating = seller.reviews.reduce((sum, review) => sum + review.rating, 0);
  seller.averageRating = totalRating / seller.totalReviews;  
  console.log("Total Rating",totalRating);
  console.log("Average Rating",seller.averageRating);


  await seller.save();

  res
    .status(201)
    .json(new ApiResponse(201, seller.reviews, "Review added successfully."));
});

export { addReview, getItemReviews, getSellerReviews, addSellerReview };
