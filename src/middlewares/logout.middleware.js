import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiErrors.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";

// export const logoutMiddleware = asyncHandler(async (req, res, next) => {
//  To logout user you first need to access token from cookies becasue you donot have an id to query from db that same users exists which i want to logout

// After accesssing access token you need to decode the data which is checked by comparing jwt verify which helps to return object of the logged user if compare value is true.

//  if matches then  

// try {
//     const token = req.cookies?.accessToken;
//     if (!token) throw new ApiError(401, "User is unauthorized");

//     const decodedData = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET_KEY )

//     if (!decodedData) throw new ApiError(404, "User doesnot exists")

//     const user = await User.findById(decodedData?._id).select("-password -refreshToken");

//     if (!user) throw new ApiError(401, "Invalid access token")

//     req.user = user;

//     next();
// }

// catch (error) {
//     throw new ApiError(401, error?.message || "Invalid access token")
// }
// })

export const verifyJwt = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies.accessToken;
        if (!token) throw new ApiError(401, "Token is not available")
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
        if (!decodedToken) throw new ApiError(404, "Cannot decode access token");
        const user = await User.findById(decodedToken._id);
        req.user = user;
        next();
    }
    catch (err) {
        throw new ApiError(401, err.message || "Invalid authorization")
    }
})