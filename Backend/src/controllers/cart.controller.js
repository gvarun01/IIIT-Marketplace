import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import Item from "../models/item.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// add to cart
// /api/cart (POST)
const addToCart = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { itemId, quantity } = req.body;
  console.log(
    "In Add to Cart with ItemId: ",
    itemId,
    " and Quantity: ",
    quantity
  );
  const user = req.user;

  // Find the item in the database
  const item = await Item.findById(itemId);
  if (!item) {
    throw new ApiError(404, "Item not found");
  }

  // Check if the item already exists in the user's cart
  const cartItem = user.cart.find(
    (cartEntry) => cartEntry.itemId.toString() === itemId
  );

  if (cartItem) {
    // If the item exists, increase its quantity
    cartItem.quantity += quantity;
  } else {
    // If the item does not exist, add a new entry to the cart
    user.cart.push({ itemId, quantity });
  }

  // Save the updated user document
  await user.save();

  // Send the response
  res
    .status(200)
    .json(new ApiResponse(200, user.cart, "Item added to cart successfully."));
});

// get cart
// /api/cart (GET)
const getCart = asyncHandler(async (req, res) => {
  const user = req.user;
  const cart = await User.findById(user._id).populate("cart.itemId");
  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart fetched successfully."));
});

// remove from cart
// /api/cart/:id (DELETE)
const removeFromCart = asyncHandler(async (req, res) => {
  const { id } = req.params; // Change from itemId to id to match route param

  if (!id) {
    throw new ApiError(400, "Item ID is required");
  }

  console.log("In Remove from Cart with ItemId: ", id);
  const user = req.user;

  // Convert ObjectId to string for comparison
  user.cart = user.cart.filter((item) => item.itemId.toString() !== id);
  await user.save();

  // Populate cart items before sending response
  const updatedUser = await User.findById(user._id).populate("cart.itemId");

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedUser.cart,
        "Item removed from cart successfully."
      )
    );
});

// update cart quantity
// /api/cart/:id (PUT)
const updateCartQuantity = asyncHandler(async (req, res) => {
  const { itemId, quantity } = req.body;
  console.log("In Update Quantity", req.body);
  const user = req.user;
  console.log("User: ", user);
  const cartItem = user.cart.find((item) => item.itemId == itemId);
  if (!cartItem) {
    throw new ApiError(404, "Item not found in cart");
  }

  cartItem.quantity = quantity;
  await user.save();

  res
    .status(200)
    .json(
      new ApiResponse(200, user.cart, "Cart quantity updated successfully.")
    );
});

// clear cart
// /api/cart (DELETE)
const clearCart = asyncHandler(async (req, res) => {
  const user = req.user;
  user.cart = [];
  await user.save();
  res.status(200).json(new ApiResponse(200, [], "Cart cleared successfully."));
});

export { addToCart, getCart, removeFromCart, clearCart, updateCartQuantity };
