import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import Item from "../models/item.model.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import axios from "axios";

const cookieOptions = {
  secure: true,
  sameSite: 'None',
};

const registerUser = asyncHandler(async (req, res) => {
  // get the user data from frontend
  // validate the user data - not empty
  // check if the user already exists
  // if the user does not exist, create a new user
  // if the user exists, return an error
  // return the user data

  console.log(req.body);

  const { firstName, lastName, email, password, age, contactNumber } = req.body;
  if (
    [firstName, lastName, email, password, age, contactNumber].some(
      (field) => field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({
    $or: [{ email }, { contactNumber }],
  });

  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  // const avatarPath = req.file?.path;
  // const avatar = await uploadOnCloudinary(avatarPath);

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    age,
    contactNumber,
  });

  const userCreated = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!userCreated) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, userCreated, "User registered successfully"));
});

// helper code for generating access and refresh tokens
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // console.log(`accessToken: ${accessToken} and refreshToken: ${refreshToken}`);

    // save the refresh token in the database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Access and Refresh Tokens Could not be generated!"
    );
  }
};

const loginUser = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { email, password, recaptchaValue } = req.body;

  if (!recaptchaValue) {
    return res.status(400).json({ message: "reCAPTCHA verification failed" });
  }

  // Verify the reCAPTCHA response with Google
  const secretKey = "6Lffp7YqAAAAAFzyWM6XZpeHAgGxUREqMD1sW-DR"; // Use your secret key
  const verificationResponse = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
    params: {
      secret: secretKey,
      response: recaptchaValue,
    },
  });

  const { success } = verificationResponse.data;

  if (!success) {
    return res.status(400).json({ message: "reCAPTCHA verification failed" });
  }

  if (!email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  // console.log(`email: ${email} and password: ${password}`);

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isValid = await user.isPasswordCorrect(password);
  if (!isValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  // console.log(user);

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  // console.log(`accessToken: ${accessToken} and refreshToken: ${refreshToken}`);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  res
    .status(200)
    .clearCookie("refreshToken")
    .clearCookie("accessToken")
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});



const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  const decodedRefreshToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );
  const user = await User.findById(decodedRefreshToken.id);
  if (!user) {
    throw new ApiError(401, "User not found");
  }

  if (user?.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is invalid");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  return res
    .status(200)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { accessToken },
        "Access token refreshed successfully"
      )
    );
});

const getUserProfile = asyncHandler(async (req, res) => {

  console.log("User Page requested for :",req.user._id);
  const user = await User.findById(req.user._id).select(
    "-password -refreshToken"
  );
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  console.log(user);
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User profile fetched successfully"));
});

const updateUserProfile = asyncHandler(async (req, res) => {
  // currently avatar is not being updataded you could only update the account details
  console.log("In Profile Update Section with id: ",req.user._id);
  const { firstName, lastName, age, contactNumber } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { firstName, lastName, age, contactNumber },
    },
    { new: true }
  ).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  console.log(user);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User profile updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarPath = req.file?.path;
  const avatar = await uploadOnCloudinary(avatarPath);

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { avatar: avatar.url },
    },
    { new: true }
  ).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User avatar updated successfully"));
});

const deleteUser = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.user._id);
  return res
    .status(200)
    .clearCookie("refreshToken")
    .clearCookie("accessToken")
    .json(new ApiResponse(200, {}, "User deleted successfully"));
});

const getSellerProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log("Seller Page requested for :",id);

  // Fetch the seller
  const seller = await User.findById(id)
  .select("-password -refreshToken")
  .populate({
    path: "reviews",
    populate: {
      path: "reviewer",
      select: "firstName lastName email"
    }
  });

  
  if (!seller) {
    throw new ApiError(404, "Seller not found");
  }

  console.log(seller);

  // Fetch all items sold by this seller
  const items = await Item.find({ seller: id });

  // Aggregate stats from item reviews
  const totalReviews = items.reduce(
    (count, item) => count + item.totalReviews,
    0
  );
  const averageRating =
    totalReviews > 0
      ? items.reduce(
          (sum, item) => sum + item.averageRating * item.totalReviews,
          0
        ) / totalReviews
      : 0;

  const responseData = {
    seller,
    items,
    stats: {
      totalItems: items.length,
      totalReviews,
      averageRating: averageRating.toFixed(2), // Ensure a clean decimal format
    },
  };

  res
    .status(200)
    .json(
      new ApiResponse(200, responseData, "Seller profile fetched successfully")
    );
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "All fields are required");
  }

  console.log("in change password section with id: ",req.user._id);
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isValid = await user.isPasswordCorrect(currentPassword);
  if (!isValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  user.password = newPassword;
  await user.save();
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getUserProfile,
  updateUserProfile,
  updateUserAvatar,
  deleteUser,
  getSellerProfile,
  changePassword,
};
