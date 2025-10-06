import mongoose, {Schema} from "mongoose";

const blogSchema = new Schema(
    {
        owner:{
            required: true,
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        content:{
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true,
        },
        image: {
            
            required: true, 
            type: Schema.Types.ObjectId,
            ref: "Image"
        }
    }, {timestamps: true}
)

export const Blog = mongoose.model("Blog", blogSchema)