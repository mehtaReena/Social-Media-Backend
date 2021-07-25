const mongoose = require("mongoose")

const Post = require("../models/post")
const User = require("../models/user")

const createPost = async (username, body) => {
    let user = await User.findOne({ username })

    let author = user._id;
    console.log("content " ,body.content)

    let newPost = new Post({content:body.content, author:author})
    console.log("New Post :" ,newPost)
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
    let user = await User.findOne({ username })
    let posts = await Post.find({author: user._id}).populate("author")
    console.log("getPost..." ,posts)
    return { status: true, result: posts }
}

module.exports = {
    createPost,
    getPost,
    deletePost,
    getPosts
}