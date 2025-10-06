import {Router} from "express"

import {verifyJWT } from '../middlewares/auth.middleware.js'
import { upload } from "../middlewares/multer.middleware.js"

import{
    getAllPosts,
    getPostByIdAndImageUrl, 
    editPost, 
    deletePost,
    getAllPostsOfCurrentUser
} from "../controllers/blog.controller.js"

const router = Router()
router.route('/all-posts/:id').get(verifyJWT,getAllPostsOfCurrentUser)
router.route('/post/:id').get(verifyJWT,getPostByIdAndImageUrl)
router.route('edit-post/:id').get(verifyJWT,editPost)


export default router