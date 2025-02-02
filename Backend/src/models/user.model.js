import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },

    lastName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      match: /^[a-zA-Z0-9._%+-]+@(students|research)\.iiit\.ac\.in$/,
    }, // Only IIIT emails allowed


    age: {
      type: Number,
      min: 18,
      required: true,
    }, // Minimum age for registration

    contactNumber: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
    }, // Hashed password

    refreshToken: {
      type: String,
      default: null,
    },

    cart: [
      {
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
        quantity: { type: Number, default: 1 },
      },
    ], // Array of items in the cart

    averageRating: {
      type: Number,
      default: 0,
    }, // Average rating of the user

    totalReviews: {  // add this field
      type: Number,
      default: 0,
    },


    reviews: [
      {
        reviewer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          index: true  // Add index for better query performance
        },
        rating: { type: Number, min: 1, max: 5, required: true },
        comment: { type: String },
        createdAt: { type: Date, default: Date.now },
      }
    ]

  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

UserSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

UserSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

UserSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

const User = mongoose.model("User", UserSchema);

export default User;
