import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            unique: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            unique: true,
        },
        fullname: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        coverImage: {
            type: String,
        },
        avatarImg: {
            type: String,
            required: true
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, "Password is required"]
        },
        refreshToken: {
            type: String
        }
    },
    { timestamps: true }
)

// the pre middleware from mongoose and bcrypt is used to encrypt the password just before it saves to database.

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10)
    next();
})

// Here isPasswordCorrect is a custom method with parameter of password which is used to compare the passwords from the user from frontend and the password saved in database. 

// if it matches it returns true else false

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
    const accessToken = jwt.sign(
        {
            _id: this.id,
            _username: this.username,
            _email: this.email,
            _fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET_KEY,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
    )
    return accessToken
}

userSchema.methods.generateRefreshToken = function () {
    const refreshToken = jwt.sign(
        {
            _id: this.id
        },
        process.env.REFRESH_TOKEN_SECRET_KEY,
        { expiresIn: REFRESH_TOKEN_EXPIRY }
    )
    return refreshToken
}


export const User = mongoose.model("User", userSchema)