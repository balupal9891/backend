import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/users.model.js";
import { ApiError } from "../utils/ApiError.js";

export const verifyUser = asyncHandler(async (req, _, next) => {

    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "")
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }

        const decodedData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = User.findById(decodedData?._id).select("-password -refreshToken")
        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }

        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(400, error?.message || "Invalid Acess token")
    }

})