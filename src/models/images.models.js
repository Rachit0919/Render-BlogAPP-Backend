import mongoose , {Schema} from "mongoose";

const imageSchema = new Schema(
    {
        imageURL:{
            type: String,
            required: true
        }
    }, {timestamps: true}
)

export const Image = mongoose.model("Image", imageSchema)