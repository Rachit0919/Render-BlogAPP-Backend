// import { V2 as cloudinary } from "cloudinary";
import cloudinaryPkg from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
import { ApiError } from "./ApiError.js";

dotenv.config({ path: "./.env" });
const { v2: cloudinary } = cloudinaryPkg; 

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// console.log("Cloudinary config: ", cloudinary.config())

const uploadOnCloudinary = async(localFilePath) =>{
    console.log("\nLocal File Path: ", localFilePath)
    try {
        if(!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto",
            secure: true,
        })
        console.log("\nResponse of cloudinary upload: ", response)
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        console.error("Cloudinary upload failed:", error); 
        fs.unlinkSync(localFilePath)
        throw new ApiError(500, "Uploading image on cloudinary failed!!!" )
    }
}

export {uploadOnCloudinary}