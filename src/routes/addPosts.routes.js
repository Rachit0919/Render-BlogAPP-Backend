import {Router} from "express"

import {verifyJWT } from '../middlewares/auth.middleware.js'
import { upload } from "../middlewares/multer.middleware.js"

import{
    createPost,
    editPost,
    deletePost,
    getAllPosts,
} from "../controllers/blog.controller.js"

const router = Router()

router.route("/posts").post(verifyJWT,upload.single("image"), createPost);
router.route("/posts/:_id").put(verifyJWT,upload.single("image"), editPost);
router.route("/posts/:_id").delete (verifyJWT,upload.single("image"), deletePost);



export default router;