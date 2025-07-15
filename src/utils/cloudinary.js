import { v2 as cloudinary } from "cloudinary";
import fs from "fs";


    // Configuration
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    const uploadOnCloudinary = async (mediaFile) => {
        try {
            if (!mediaFile) return null;
            const uploadFile = await cloudinary.uploader.upload(mediaFile,
                { resource_type: "auto" }
            )
            console.log("File has been uploaded on cloudinary ", uploadFile.url)
            fs.unlinkSync(mediaFile)
            return uploadFile
        }
        catch (err) {
            fs.unlinkSync(mediaFile) // remove the locally temp file as upload operation got failed
        }
    }
    
    export {uploadOnCloudinary}