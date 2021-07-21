const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    following: {
        type: [mongoose.SchemaTypes.ObjectId],
        ref: "User",
        default: []
    },
    followers: {
        type: [mongoose.SchemaTypes.ObjectId],
        ref: "User",
        default: []
    },
    refresh_token: {
        type: String,
        // unique: true
        default:null
    }
})

const UserModel = new mongoose.model("User", UserSchema)

module.exports = UserModel