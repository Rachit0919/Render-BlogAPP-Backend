import {User} from '../models/users.models.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asynchHandler.js'
import jwt from 'jsonwebtoken'

// export const verifyJWT = asyncHandler( async(req, res, next) =>{
//     try {
//         // console.log("verify JWT called")
//         // console.log("req.cookies inside verify JWT:", req.cookies.accessToken)
//         const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
//         // console.log("\nToken: ", token)
        
//         if(!token){
//             throw new ApiError(401, "Unauthorized request")
//         }
//         // console.log("\nToken recieved:", token)
//         const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
//         // console.log("\nDecoded Token: ", token)

//         const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
//         if(!user){
//             throw new ApiError(401, "Invalid access token")
//         }
//         // console.log("\nUSer at middleware:", user)
//         req.user = user
//         next()
//     } catch (error) {
//         console.log("\nAuth middleware error: ", error, error.message)
//         if (error.name === "TokenExpiredError") {
//       // send a clear 401 so client can refresh
//       return res.status(401).json({ message: "jwt expired" });
//     }
//         throw new ApiError(401, error.message || "Invalid Access", [error])
//     }
// })



export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized request" });
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid access token" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Auth middleware error: ", error.message);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "JWT expired" });
    }
    return res.status(401).json({ success: false, message: error.message || "Invalid Access" });
  }
});
