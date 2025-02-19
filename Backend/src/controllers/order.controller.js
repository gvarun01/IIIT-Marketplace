import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Order from "../models/order.model.js";
import Item from "../models/item.model.js";
import bcrypt from "bcrypt";

// Place a new order
// /api/order	(POST)
const placeOrder = asyncHandler(async (req, res) => {
  const { items, totalAmount } = req.body;
  const buyerId = req.user._id;
  console.log(
    "Placing order for buyer: ",
    buyerId,
    " with items: ",
    items,
    " and total amount: ",
    totalAmount
  );

  if (!items?.length) {
    throw new ApiError(400, "Items are required");
  }

  // Generate a random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const order = await Order.create({
    transactionId: `TXN${Date.now()}`,
    buyerId,
    items,
    totalAmount,
    hashedOTP: otp, // This will be hashed by the pre-save middleware
    status: "Pending",
  });

  // Return the OTP in the response so the buyer can share it with the seller
  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { order, otp },
        "Order placed successfully. Please save the OTP for delivery verification."
      )
    );
});

// Get all orders for logged-in user
// /api/order	(GET)
const getOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const userId = req.user._id;

  const orders = await Order.find({
    $or: [
      { buyerId: userId },
      {
        items: {
          $elemMatch: {
            itemId: {
              $in: await Item.find({ seller: userId }).distinct("_id"),
            },
          },
        },
      },
    ],
  })
    .skip(skip)
    .limit(limit)
    .populate("buyerId", "firstName lastName email")
    .populate({
      path: "items.itemId",
      populate: { path: "seller", select: "firstName lastName email" },
    })
    .sort("-createdAt");

  const totalOrders = await Order.countDocuments({
    $or: [
      { buyerId: userId },
      {
        items: {
          $elemMatch: {
            itemId: {
              $in: await Item.find({ seller: userId }).distinct("_id"),
            },
          },
        },
      },
    ],
  });

  res.status(200).json({
    status: 200,
    data: orders,
    totalOrders,
    totalPages: Math.ceil(totalOrders / limit),
    currentPage: page,
  });
});

// Get specific order details
// /api/order/:id	(GET)
const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const order = await Order.findOne({
    _id: id,
    $or: [
      { buyerId: userId },
      {
        items: {
          $elemMatch: {
            itemId: {
              $in: await Item.find({ seller: userId }).distinct("_id"),
            },
          },
        },
      },
    ],
  })
    .populate("buyerId", "username email")
    .populate({
      path: "items.itemId",
      populate: {
        path: "seller",
        select: "username email",
      },
    });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order details fetched successfully"));
});

const getOrderAsBuyer = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  console.log("Fetching all orders for buyer:", userId);

  const orders = await Order.find({
    buyerId: userId,
  })
    .sort({ createdAt: -1 })
    .populate("buyerId", "firstName lastName email")
    .populate({
      path: "items.itemId",
      populate: {
        path: "sellerId",
        select: "firstName lastName email",
      },
    });

  console.log(
    "Orders fetched for buyer:",
    orders,
    "with items ",
    orders[0].items
  );

  console.log("Orders fetched for buyer:", orders);

  if (!orders || orders.length === 0) {
    throw new ApiError(404, "No orders found for this buyer");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Buyer orders fetched successfully"));
});

const getOrderAsSeller = asyncHandler(async (req, res) => {
  console.log("Fetching orders for seller:", req.user._id);
  const sellerId = req.user._id;

  const sellerItems = await Item.find({ sellerId }).distinct("_id");

  console.log("Fetching orders for seller items:", sellerItems);

  const orders = await Order.find({
    "items.itemId": { $in: sellerItems },
  })
    .sort({ createdAt: -1 })
    .populate("buyerId", "firstName lastName email")
    .populate({
      path: "items.itemId",
      model: "Item",
      select: "name price description images sellerId",
      populate: {
        path: "sellerId",
        model: "User",
        select: "firstName lastName email",
      },
    });

    // console.log("Orders fetched for seller:", orders);

  if (!orders || orders.length === 0) {
    throw new ApiError(404, "No orders found for this seller");
  }

  // Filter items for current seller and preserve quantities
  const filteredOrders = orders.map((order) => ({
    ...order.toObject(),
    items: order.items.filter(
      (item) => item.itemId.sellerId._id.toString() === sellerId.toString()
    ),
  }));

  console.log("Filtered orders for seller:", filteredOrders);

  return res
    .status(200)
    .json(
      new ApiResponse(200, filteredOrders, "Seller orders fetched successfully")
    );
});

// Get orders for seller to deliver
// /api/order/deliver	(GET)
const getOrdersToDeliver = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;
  
  console.log("Fetching pending orders for seller:", sellerId);

  const sellerItems = await Item.find({ sellerId }).distinct("_id");

  const orders = await Order.find({
    "items.itemId": { $in: sellerItems },
    status: "Pending"  // Only get pending orders
  })
    .sort({ createdAt: -1 })
    .populate("buyerId", "firstName lastName email")
    .populate({
      path: "items.itemId",
      model: "Item",
      select: "name price description images sellerId",
      populate: {
        path: "sellerId",
        model: "User",
        select: "firstName lastName email",
      },
    });

  if (!orders || orders.length === 0) {
    throw new ApiError(404, "No pending orders found for this seller");
  }

  // Filter items for current seller and preserve quantities
  const filteredOrders = orders.map((order) => ({
    ...order.toObject(),
    items: order.items.filter(
      (item) => item.itemId.sellerId._id.toString() === sellerId.toString()
    ),
  }));

  return res
    .status(200)
    .json(
      new ApiResponse(200, filteredOrders, "Pending orders fetched successfully")
    );
});

// Close/Verify order with OTP
// /api/orders/close	(POST)
const closeOrder = asyncHandler(async (req, res) => {
  const { orderId, otp } = req.body;
  const sellerId = req.user._id;

  if (!orderId || !otp) {
    throw new ApiError(400, "Order ID and OTP are required");
  }

  console.log("Closing order:", orderId, "OTP:", otp, "Seller:", sellerId);

  // First check if order exists
  const order = await Order.findOne({
    _id: orderId,
    status: "Pending"
  }).populate({
    path: "items.itemId",
    select: "sellerId"
  });

  if (!order) {
    throw new ApiError(404, "Order not found or already completed");
  }
  console.log("Item seller:", order.items[0].itemId.sellerId);

  // Verify seller owns at least one item in order
  const hasSellerItem = order.items.some(
    item => item.itemId.sellerId.toString() === sellerId.toString()
  );

  if (!hasSellerItem) {
    throw new ApiError(403, "Not authorized to close this order");
  }

  // Verify OTP
  const isValidOTP = await bcrypt.compare(otp, order.hashedOTP);
  if (!isValidOTP) {
    throw new ApiError(400, "Invalid OTP");
  }

  // Update order status
  order.status = "Completed";
  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order closed successfully"));
});

// Verify and deliver order
// /api/order/verify-delivery	(POST)
const verifyAndDeliverOrder = asyncHandler(async (req, res) => {
  const { orderId, otp } = req.body;
  const deliveryPersonId = req.user._id;

  if (!orderId || !otp) {
    throw new ApiError(400, "Order ID and OTP are required");
  }

  const order = await Order.findOne({
    _id: orderId,
    deliveryPersonId,
    status: "Pending",
  });

  if (!order) {
    throw new ApiError(404, "Order not found or already completed");
  }

  // Verify OTP
  const isValid = await order.isOTPCorrect(otp);
  if (!isValid) {
    throw new ApiError(400, "Invalid OTP");
  }

  // Update order status
  order.status = "Delivered";
  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order delivered successfully"));
});

export {
  placeOrder,
  getOrders,
  getOrderById,
  closeOrder,
  getOrdersToDeliver,
  verifyAndDeliverOrder,
  getOrderAsBuyer,
  getOrderAsSeller,
};
