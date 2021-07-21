const User = require("../models/user")
const bcrypt = require("bcrypt")

const createUser = async ({ username, email, password }) => {
    console.log(username ,email)

    if (!username || !email || !password) {
        return { status: false, result: "Incomplete details" }
    }
    let emailRegex = /.+@.+[.].+/
    if (!emailRegex.test(email)) {
        return { status: false, result: "Bad email format" }
    }
    let hash = await bcrypt.hash(password, 10)
    let newUser = new User({ username, email, password: hash })
    try {
        let savedUser = await newUser.save()
        return { status: true, result: savedUser }
    }
    catch (e) {
        if (e.message.includes("dup key: { email")) {
            return { status: false, result: "Email is already in use" }
        }
        else if (e.message.includes("dup key: { username")) {
            return { status: false, result: "Username is already in use" }
        }
        else {
            console.log(" create User", e.message)
            return { status: false, result: e.message }
        }
    }
}

const validateUser = async ({ email, password }) => {
    if (!email || !password) {
        return { status: false, result: "Incomplete details" }
    }
    let emailRegex = /.+@.+[.].+/
    if (!emailRegex.test(email)) {
        return { status: false, result: "Bad email format" }
    }
    let user = await User.findOne({ email })
    if (!user) {
        return { status: false, result: "No user with the email " + email + " found" }
    }
    if (await bcrypt.compare(password, user.password)) {
        return { status: true, result: user }
    }
    else {
        return { status: false, result: "Wrong password" }
    }
}

const addRefresh = async (username, refresh_token) => {
    try {
        await User.updateOne({ username }, { $set: { refresh_token } })
        console.log("rrrrr")
        return { status: true, result: { message: 'Refresh token saved' } }
    }
    catch (e) {
        console.log(e.message)
        return { status: false, result: { message: e.message } }
    }
}

const removeRefresh = async (username) => {
    try {
        await User.updateOne({ username }, { $set: { refresh_token: undefined } })
        return { status: true, result: { message: 'Refresh token deleted' } }
    }
    catch (e) {
        return { status: false, result: { message: 'Something went wrong' } }
    }
}

const validateRefresh = async (username, refresh_token) => {
    let user = await User.findOne({ username, refresh_token })
    console.log(user)
    if (user) {
        return { status: true, result: user }
    }
    else {
        return { status: false, result: { message: "Invalid user" } }
    }
}

const followUser = async (currentUsername, targetUsername) => {
    if (currentUsername === targetUsername) {
        return { status: false, result: { message: "You can't follow yourself, you can try but you won't succeed" } }
    }
    let currentUser = await User.findOne({ username: currentUsername })
    if (!currentUser) {
        return { status: false, result: { message: "Current user is somehow not found" } }
    }
    let targetUser = await User.findOne({ username: targetUsername })
    if (!targetUser) {
        return { status: false, result: { message: "There is no such user" } }
    }
    try {
        currentUser.following.push(targetUser)
        targetUser.followers.push(currentUser)
        currentUser.save()
        targetUser.save()
        return { status: true, result: { message: "You followed " + targetUsername } }
    }
    catch (e) {
        return { status: false, result: { message: e.message } }
    }
}


const unfollowUser = async (currentUsername, targetUsername) => {
    let currentUser = await User.findOne({ username: currentUsername })
    if (!currentUser) {
        return { status: false, result: { message: "Current user is somehow not found" } }
    }
    let targetUser = await User.findOne({ username: targetUsername })
    if (!targetUser) {
        return { status: false, result: { message: "There is no such user" } }
    }
    if (!currentUser.following.includes(targetUser._id)) {
        return { status: false, result: { message: "You are not following " + targetUsername + ". Follow first before unfollowing." } }
    }
    try {
        await User.updateOne({ username: currentUsername }, { $pull: { following: targetUser._id } })
        await User.updateOne({ username: targetUsername }, { $pull: { followers: currentUser._id } })
        return { status: true, result: { message: "You unfollowed " + targetUsername } }
    }
    catch (e) {
        console.log(e)
        return { status: false, result: { message: e.message } }
    }
}

const blockUser = async (currentUsername, targetUsername) => {
    let currentUser = await User.findOne({ username: currentUsername })
    if (!currentUser) {
        return { status: false, result: { message: "Current user is somehow not found" } }
    }
    let targetUser = await User.findOne({ username: targetUsername })
    if (!targetUser) {
        return { status: false, result: { message: "There is no such user" } }
    }
    if (currentUser.followers.includes(targetUser._id)) {
        try {
            await User.updateOne({ username: currentUsername }, { $pull: { follower: targetUser._id } })
            await User.updateOne({ username: targetUsername }, { $pull: { following: currentUser._id } })
            return { status: true, result: { message: targetUsername + ' is not following you anymore' } }
        }
        catch (e) {
            console.log(e)
            return { status: false, result: { message: e.message } }
        }
    }
    else {
        return { status: true, result: { message: "Nothing happened" } }
    }

}

const getFollowers = async (username) => {
    let user = await User.findOne({ username })
    if (user) {
        return { status: true, result: user.followers }
    }
    else {
        return { status: false, result: {message: "User not found"} }
    }
}

const getFollowing = async () => {
    let user = await User.findOne({ username })
    if (user) {
        return { status: true, result: user.following }
    }
    else {
        return { status: false, result: {message: "User not found"} }
    }
}




module.exports = {
    createUser,
    validateUser,
    addRefresh,
    removeRefresh,
    validateRefresh,
    followUser,
    unfollowUser,
    blockUser,
    getFollowers,
    getFollowing
}