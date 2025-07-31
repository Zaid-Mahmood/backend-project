import { Router } from "express";
import { registerUser, loginUser, logoutUser, newRefreshToken, changePassword, getCurrentUser, changeAccountDetails, changeAvatarImg, changeCoverImg } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/logout.middleware.js";
const router = Router();

// For post requests
router.route("/register").post(
    // Multer middleware added to make the avatar and cover img transfer from frontend to express server while posting and ensure the name of field should be exact same in frontend payload and in here

    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "cover",
            maxCount: 1
        }
    ]),
    registerUser)

router.route("/login").post(loginUser)

router.route("/logout").post(verifyJwt, logoutUser)

router.route("/refresh-token").post(newRefreshToken)

router.route("/change-password").post(verifyJwt, changePassword)

router.route("/current-user").get(verifyJwt, getCurrentUser)

router.route("/change-account-details").post(verifyJwt, changeAccountDetails)

router.route("/change-avatar-Image").post(verifyJwt, changeAvatarImg)

router.route("/change-cover-Image").post(verifyJwt, changeCoverImg)



export default router;