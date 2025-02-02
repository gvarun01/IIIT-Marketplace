import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    category: {
      type: String,
      INDEX: true,
      enum: [
        "Electronics",
        "Clothing",
        "Home & Garden",
        "Sports & Outdoors",
        "Toys & Games",
        "Health & Beauty",
        "Automotive",
        "Other",
      ],
      required: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    images: [{ type: String, required: true }], // Array of image URLs for the item
    // reviews
    reviews: [
      {
        reviewer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        rating: { type: Number, min: 1, max: 5, required: true },
        comment: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    averageRating: { type: Number, default: 0 }, // Aggregated from item reviews
    totalReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Item = mongoose.model("Item", ItemSchema);

export default Item;
