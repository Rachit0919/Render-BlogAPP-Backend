import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken'

export const verifyJWT = asyncHandler( async(req, _, next) => {
    try {
        console.log("verify JWT called");
        console.log("req.cookies inside verify JWT:", req.cookies);
        
        // Try to get token from cookies first, then from Authorization header
        let token = req.cookies?.accessToken;
        
        // If no cookie token, check Authorization header (with or without Bearer prefix)
        if (!token) {
            const authHeader = req.header("Authorization");
            console.log("Authorization header:", authHeader);
            
            if (authHeader) {
                // Handle both "Bearer token" and just "token" formats
                token = authHeader.startsWith("Bearer ") 
                    ? authHeader.replace("Bearer ", "")
                    : authHeader;
            }
        }
        
        console.log("\nToken: ", token);
        
        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid access token");
        }

        req.user = user;
        next();

    } catch (error) {
        console.log("\nAuth middleware error: ", error);
        throw new ApiError(401, error?.message || "Invalid access Token");
    }
})