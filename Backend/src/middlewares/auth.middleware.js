import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {ApiError} from "../utils/ApiError.js";

const verifyAccessToken = asyncHandler(async (req, res, next) => {
    try {
        const accessToken = req.cookies?.accessToken || req.headers("Authorization")?.replace("Bearer ", "");
        if (!accessToken) {
            throw new ApiError(401, "Access token is required");
        }
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded.id).select("-password -refreshToken");
        if (!user) {
            throw new ApiError(401, "User not found");
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json(new ApiResponse(401, null, "Access token is invalid"));
    }
});

export { verifyAccessToken }; 
