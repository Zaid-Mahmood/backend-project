import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();

// For post requests
router.route("/register").post(
    // Multer middleware added to make the avatar and cover img transfer from frontend to express server while posting and ensure the name of field should be exact same in frontend payload and in here
    
    upload.fields([
        {
        name : "avatar" ,
        maxCount : 1
    } ,
     {
        name : "cover" ,
        maxCount : 1
    } 
]) ,
    registerUser)

export default router;