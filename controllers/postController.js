const mongoose = require("mongoose")

const Post = require("../models/post")
const User = require("../models/user")

const createPost = async (username, body) => {
    let user = await User.findOne({ username })

    let author = user._id;
    console.log("content ", body.content)

    let newPost = new Post({ content: body.content, author: author })
    console.log("New Post :", newPost)
    try {
        let savedPost = await newPost.save()
        return { status: true, result: savedPost }
    }
    catch (e) {
        return { status: false, result: { message: e.message } }
    }
}

const getPost = async (username, postId) => {
    let id = mongoose.mongo.ObjectID(postId)
    let post = await Post.findOne({ _id: id }).populate("author")

    if (!post) {
        return { status: false, result: { message: "Invalid post id" } }
    }
    if (post.author.username === username) {
        return { status: true, result: post }
    }
    else {
        return { status: false, result: { message: "Access denied" } }
    }
}

const deletePost = async (username, postId) => {
    let id = mongoose.mongo.ObjectID(postId)
    let post = await Post.findOne({ _id: id }).populate("author")
    if (!post) {
        return { status: false, result: { message: "Invalid post id" } }
    }
    if (post.author.username === username) {
        await Post.deleteOne(post)
        return { status: true, result: "Deleted Successfully" }
    }
    else {
        return { status: false, result: { message: "Access denied" } }
    }
}

const getPosts = async (username) => {
    console.log(" getPosts .." , username)
    let user = await User.findOne({ username })
    let posts = await Post.find({ author: user._id }).populate("author")
    console.log("getPost...", posts)
    return { status: true, result: posts }
}


const getTop20Post = async (username) => {
    let topPost = [];
    let user = await User.findOne({ username })
    try {

        const followingsId = user.following;
        followingsId.push(user._id)
        console.log("getTop20Post", followingsId)

        // let userID = mongoose.mongo.ObjectID(id)
        let posts = await Post.find().populate("author").sort({ "createdAt": -1 })
        for (let post of posts) {
            if (followingsId.includes(post.author._id)) {
                //    console.log(" getTop20Post" , post)
                if (topPost.length < 3)
                    topPost.push(post)
            }
        }

        if (!topPost) {
            return { status: false, result: { message: "Invalid post id" } }
        }
        else {
            console.log(" getTop20Post", topPost.length)
            return { status: true, result: topPost }
        }
    }
    catch (e) {
        return (e.message);
    }
}


const addLike = async (username, postID) => {
    let user = await User.findOne({ username })

    let userID = user._id;
    console.log (userID , "ANd .." , postID )
    try {
        let hasLiked = await Post.findOne({ _id: postID, likes: { "$in": userID } });
        console.log("hasLiked " , hasLiked)
        if (hasLiked) {
            await Post.findByIdAndUpdate(postID, { $pull: { likes: userID } });
            return { status: true, result: "disliked" }
        }
        await Post.findByIdAndUpdate(postID, { $push: { likes: userID } });
        return { status: true, result: "liked" }

    }
    catch (e) {
        return { status: false, result: e.message }
    }
}






module.exports = {
    createPost,
    getPost,
    deletePost,
    getPosts,
    getTop20Post,
    addLike
}