import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessTokenAndRefreshToken = async (id) => {
    try {
        const user = await User.findById(id);

        const accessToken = await user?.generateAccessToken();

        const refreshToken = await user?.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    }
    catch (err) {
        throw new ApiError(500, "Something went wrong while generating access token and refresh token")
    }

}

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
        coverImage: cover?.url || "",

    })

    const userCreated = await User.findById(user._id).select("-refreshToken -password");

    if (!userCreated) {
        throw new ApiError(500, "Error in creating user")
    }

    return res.status(201).json(
        new ApiResponse(200, userCreated, "User created successfully !!")
    )

})

const loginUser = asyncHandler(async (req, res) => {

    // first req the specific login fields from frontend

    // username and email check if it is provided from frontend

    // find the user from db on the basis of email or username

    // check the password while comparing with the entered password and the passwd in db

    // if user existed in db and pswd is verified then generate refresh and access token

    // add the refresh token in the user model and save in db

    // send cookie from server to frontend

    // return response to frontend with status code , json includes refresh token and access token and message that user logged in successfully



    const { username, email, password } = req.body;

    if (!(username && email)) {
        throw new ApiError(401, "Username and email is not provided !")
    }

    const userExisted = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (!userExisted) throw new ApiError(404, "user not existed in database")

    const validatePswd = await userExisted.isPasswordCorrect(password);

    if (!validatePswd) {
        throw new ApiError(401, "Invalid credentials !!")
    }

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(userExisted._id);

    const loggedUser = await User.findById(userExisted._id).select("-password");

    return res
        .status(200)
        .cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true
        })
        .cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true
        })
        .json(
            new ApiResponse((200), {
                user: { loggedUser }
            },

                "User logged in successfully !"
            ))

})

const logoutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(req.user._id, {
        $set: {
            refreshToken: undefined
        }
    }
        ,
        {
            new: true
        }).select("-password -refreshToken")
    return res
        .status(200)
        .clearCookie("accessToken", { httpOnly: true, secure: true })
        .clearCookie("refreshToken", { httpOnly: true, secure: true })
        .json(new ApiResponse(200, {}, "logged out successfully"))
})

const newRefreshToken = asyncHandler(async (req, res) => {
    try {
        const incomingToken = await req.cookies.refreshToken;
        if (!incomingToken) throw new ApiError(401, "Unauthorized")
        const decodeToken = jwt.verify(incomingToken, process.env.REFRESH_TOKEN_SECRET_KEY);
        if (!decodeToken) throw new ApiError(401, "Token has not been decoded")
        const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(decodeToken._id);
        const user = await User.findById(decodeToken._id).select("-password");
        if (user.refreshToken !== refreshToken) throw new ApiError(401, "user can't logged in succesfully due to different access token ! !");
        return res
            .status(200)
            .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
            .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true })
            .json(new ApiResponse(200, user, "Refresh token has been updated"))
    }
    catch (err) {
        throw new ApiError(401, "Unauthorized token")
    }
})

const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    if (!(newPassword === confirmPassword)) throw new ApiError(401, "Password doesnot match");

    const user = await User.findById(req.user._id);
    const validatePassword = await user.isPasswordCorrect(oldPassword)
    if (!validatePassword) throw new ApiError(401, "Old Password doesnot matched")

    user.password = newPassword;

    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password has been changed successfully !!"))
})


const getCurrentUser = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) throw new ApiError(400, "User doesnot exist")
    return res
        .status(200)
        .json(new ApiResponse(200, user, "Current user has been fetched !!"))
})

const changeAccountDetails = asyncHandler(async (req, res) => {
    const { username, email, fullname } = req.body;
    if (!(username || email || fullname)) {
        throw new ApiError(401, "All Fields are required !!")
    }
    const updatedUserDetails = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                username, email, fullname
            }
        },
        { new: true }).select("-password")
    return res
        .status(200)
        .json(new ApiResponse(200, updatedUserDetails, "User account details has been changed successfully !!"))
})

const changeAvatarImg = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) throw new ApiError(401, "Avatar local path is missing")
    const uploadAvatarImg = await uploadOnCloudinary(avatarLocalPath);
    if (!uploadAvatarImg.url) throw new ApiError(401, "Avatar Image got failed while uploading...")
    const updatedAvatarUrl = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatarImg: uploadAvatarImg.url
            }
        },
        { new: true }
    ).select("-password")
    return res
        .status(200)
        .json(new ApiResponse(200, updatedAvatarUrl, "Avatar Image has been uploaded successfully !!"))
})

const changeCoverImg = asyncHandler(async (req, res) => {
    const coverLocalPath = req.file?.path;
    if (!coverLocalPath) throw new ApiError(401, "Cover local path is missing")
    const uploadCoverImg = await uploadOnCloudinary(coverLocalPath);
    if (!uploadCoverImg.url) throw new ApiError(401, "Cover Image got failed while uploading...")
    const updatedCoverUrl = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatarImg: uploadCoverImg.url
            }
        },
        { new: true }
    ).select("-password")
    return res
        .status(200)
        .json(new ApiResponse(200, updatedCoverUrl, "Cover Image has been uploaded successfully !!"))
})

export { registerUser, loginUser, logoutUser, newRefreshToken, changePassword, getCurrentUser, changeAccountDetails, changeAvatarImg, changeCoverImg };