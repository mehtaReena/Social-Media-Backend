const mongoose = require("mongoose")

const PostSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User",
        required: true
    },
    likes: {
        type: [mongoose.SchemaTypes.ObjectId],
        ref: "User",
        default: []
    }
}, { timestamps: true })

const PostModel = new mongoose.model("Post", PostSchema)

module.exports = PostModel