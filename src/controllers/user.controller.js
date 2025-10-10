import {asyncHandler} from '../utils/asynchHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/users.models.js'
import{ApiResponse} from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

const generateAccessAndRefreshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const refreshToken = user.generateRefreshToken()
        const accessToken = user.generateAccessToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {refreshToken, accessToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access tokens")
    }
}

const registerUser = asyncHandler(async(req, res) =>{

    const {fullName, email,  password} = req.body

    // console.log("\nfullName:",fullName, "\n Email: ",email,"\n password: ", password)

    if([fullName, email,  password].some((field) => field.trim() ==="")){
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.create({
        fullName,
        email,
        password,
        
    })
    console.log("User:", user)

    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    // console.log("Created User: ", createdUser)

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

})

const loginUser = asyncHandler( async(req, res) =>{
    const {email, password} = req.body
    console.log( "\n Email: ",email,"\n password: ", password)
    
    if( !email){
        throw new ApiError(400, "eEmail is required")
    }
    const user = await User.findOne({
        email
    })
    console.log("\nUser: ", user)

    if(!user){
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user credentials")

    }

    const {refreshToken, accessToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/"
    }
    console.log("\nToken during login:", accessToken)
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in Successfully",

        )
    )
})

// const logOutUser = asyncHandler(async(req, res) =>{
//     await User.findOneAndUpdate(
//         {_id: req.user._id},{
//             $unset:{
//                 refreshToken: 1
//             }
//         },
//         {
//             new: true
//         }
//     )
//     const options = {
//         httpOnly: true,
//         secure: false,
//         sameSite: "lax"
//     }

//     return res
//     .status(200)
//     .clearCookie("accessToken",  options)
//     .clearCookie("refreshToken",  options)
//     .json(
//         new ApiResponse(
//             200,
//             {},
//             "User logged Out Successfully"
//         )
//     )
// })

const logOutUser = asyncHandler(async (req, res) => {
  // Remove refresh token from DB
  await User.findOneAndUpdate(
    { _id: req.user._id },
    { $unset: { refreshToken: 1 } },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,      
    sameSite: "none",
    path: "/"           
  };

  res.clearCookie("accessToken", options);
  res.clearCookie("refreshToken", options);

  return res.status(200).json(
    new ApiResponse(200, {}, "User logged out successfully")
  );
});

const getCurrentUser = asyncHandler(async(req, res) =>{
    console.log("Inside getCurrentUser. User:", req.user);
    if (!req.user) {
        throw new ApiError(401, "Unauthorized: User not found in request after JWT verification");
    }

    return res
    .status(200)
    
    .json(
        new ApiResponse(
            200,
             req.user,
             "Fetched Current User"
        )
    )
})
const refreshAccessToken = asyncHandler(async(req, res) =>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh token is expired or used")
        }
    
        const options = {
            httpOnly: true,
            secure: true,
            // sameSite: "lax"
        }
    
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken , refreshToken: refreshToken
                },
                "Acces token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh Token")
    }

    
        
    
})


export{
    registerUser,
    loginUser,
    logOutUser,
    getCurrentUser,
    refreshAccessToken
}