import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser = asyncHandler(async (req, res) => {
    //    Register user processes

    //  1- require all fields from frontend

    // 2- validate the required fields 

    // 3- check if user already exists (username or email)

    // 3- get avatar and cover img from  server and then server to cloudinary server

    //  4- use the user model to transfer all the user fields into a single object with mongoose create method 

    // and create entry in db.

    // 5- remove password or refresh token fields to transfer to frontend from db

    // 6- check for user creation

    // 7- return response


    const { username, email, fullname, password } = req.body;

    if ([username, email, fullname, password].some((field) => (
        field?.trim() === ""
    ))) {
        throw new ApiError(404, "All fields are required !!")
    }

    const existedUser = await User.findOne(
        {
            $or: [{ username }, { email }]
        }
    )

    if (existedUser) {
        throw new ApiError(409, "User or email already exists")
    }

    const avatarImgLocalPath = req.files.avatar[0]?.path;

    if (!avatarImgLocalPath) {
        throw new ApiError(400, "Avatar Img not found on local server")
    }
    
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files?.cover) && req.files?.cover.length > 0) {
        coverImageLocalPath = req.files.cover[0]?.path;
    }

    const avatar = await uploadOnCloudinary(avatarImgLocalPath);
    const cover = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar File not been uploaded on cloudinary")
    }

    const user = await User.create({
        username,
        email,
        fullname,
        password,
        avatarImg: avatar.url,
        coverImage: cover?.url || ""
    })

    const userCreated = await User.findById(user._id).select("-refreshToken -password");

    if (!userCreated) {
        throw new ApiError(500, "Error in creating user")
    }

    return res.status(201).json(
        new ApiResponse(200, userCreated, "User created successfully !!")
    )

})

export { registerUser };