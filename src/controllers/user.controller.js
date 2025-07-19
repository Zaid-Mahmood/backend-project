import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
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



const {username , email , password} = req.body;

if(!(username && email)){
    throw new ApiError(401 ,"Username and email is not provided !")
}

const userExisted = await User.findOne({
    $or : [{email} , {username}]
})

if(!userExisted) throw new ApiError(500 ,"user not existed in database")

const validatePswd = await userExisted.isPasswordCorrect(password);

if(!validatePswd){
    throw new ApiError(401 ,"Invalid credentials !!")
}

const {accessToken , refreshToken} = await generateAccessTokenAndRefreshToken(userExisted._id);

const loggedUser = await User.findById(userExisted._id).select("-password");

return res
.status(200)

.json(
    new ApiResponse((200),{
    user : {loggedUser}
},

    "User logged in successfully !"
))
.cookie("accessToken" , accessToken , {
    httpOnly : true , 
    secure : true
})
.cookie("refreshToken" , refreshToken , {
    httpOnly : true , 
    secure : true
})

















})

export { registerUser, loginUser };