import { asyncHandler } from "../utils/asyncHandler.js";
import Item from "../models/item.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const createItem = asyncHandler(async (req, res) => {
  const { name, price, description, category } = req.body;

  if ([name, price, category].some((field) => !field)) {
    throw new ApiError(400, "Name, price, and category are required.");
  }

  // Handle multiple image uploads
  const imagePaths = req.files?.map((file) => file.path) || [];
  const imageUrls = [];

  for (const path of imagePaths) {
    const uploadedImage = await uploadOnCloudinary(path);
    imageUrls.push(uploadedImage.url);
  }

  const newItem = await Item.create({
    name,
    price,
    description,
    category,
    sellerId: req.user._id,
    images: imageUrls, // Store array of image URLs
  });

  res
    .status(201)
    .json(new ApiResponse(201, newItem, "Item created successfully."));
});

const getAllItems = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const skip = (page - 1) * limit;

  const filters = { ...req.query };
  delete filters.page;
  delete filters.limit;

  // Handle multiple categories
  if (filters.categories) {
    const categoriesArray = filters.categories.split(',');
    filters.category = { $in: categoriesArray };
    delete filters.categories;
  }

  // Handle name search
  if (filters.name) {
    filters.name = { 
      $regex: filters.name, 
      $options: 'i'
    };
  }

  let sortOptions = {};
  
  if (filters.sort) {
    const sortField = filters.sort;
    delete filters.sort;

    if (sortField.startsWith('-')) {
      sortOptions[sortField.substring(1)] = -1;
    } else {
      sortOptions[sortField] = 1;
    }
  } else {
    sortOptions.createdAt = -1;
  }

  const items = await Item.find(filters)
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)
    .populate("sellerId", "firstName lastName email");

  const totalItems = await Item.countDocuments(filters);

  res.status(200).json({
    status: 200,
    data: items,
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
    currentPage: page,
  });
});


const getItemById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const item = await Item.findById(id)
  .populate(
    "sellerId",
    "firstName lastName email"
  )
  .populate("reviews.reviewer", "firstName lastName email");

  if (!item) {
    throw new ApiError(404, "Item not found.");
  }

  res
    .status(200)
    .json(new ApiResponse(200, item, "Item fetched successfully."));
});

const updateItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const item = await Item.findById(id);
  if (!item) {
    throw new ApiError(404, "Item not found.");
  }

  if (!item.sellerId) {
    throw new ApiError(400, "Item has no seller information.");
  }

  if (item.sellerId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this item.");
  }

  // Handle multiple image uploads
  const imagePaths = req.files?.map((file) => file.path) || [];
  const imageUrls = [];

  for (const path of imagePaths) {
    const uploadedImage = await uploadOnCloudinary(path);
    imageUrls.push(uploadedImage.url);
  }

  const updatedItem = await Item.findByIdAndUpdate(
    id,
    {
      ...req.body,
      images: imageUrls.length > 0 ? imageUrls : item.images, // Use new images or keep old ones
    },
    { new: true }
  );

  res
    .status(200)
    .json(new ApiResponse(200, updatedItem, "Item updated successfully."));
});

const deleteItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const item = await Item.findById(id);

  if (!item) {
    throw new ApiError(404, "Item not found.");
  }

  // Ensure the logged-in user is the seller of the item
  if (item.seller.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this item.");
  }

  await item.deleteOne();

  res
    .status(200)
    .json(new ApiResponse(200, null, "Item deleted successfully."));
});

export { createItem, getAllItems, getItemById, updateItem, deleteItem };
