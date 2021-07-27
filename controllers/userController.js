const User = require("../models/user")
const bcrypt = require("bcrypt")

const defaultPic = '/user.jpg'

const createUser = async ({ name, username, email, password,photoUrl}) => {
    console.log(username,email,password)
    const userExists = await User.findOne({ email });
    const userNameExists = await User.findOne({ username });
    if (userExists && userNameExists) {
        return { status: false, result: "Account already exist!" };
    }
    else {
        if (!name||!username || !email || !password) {
            return { status: false, result: "Incomplete details" }
        }
        let emailRegex = /.+@.+[.].+/
        if (!emailRegex.test(email)) {
            return { status: false, result: "Bad email format" }
        }

        if (!photoUrl || !photoUrl.length) {
            photoUrl = defaultPic
        }
        let hash = await bcrypt.hash(password, 10)
        let newUser = new User({name,username, email, password: hash ,photoUrl})
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
                return { status: false, result: e.message }
            }
        }
    }
}

    const validateUser = async ({ username, password }) => {
        console.log(username)
        if (!username || !password) {
            return { status: false, result: "Incomplete details" }
        }
        /* let emailRegex = /.+@.+[.].+/
        if (!emailRegex.test(email)) {
            return { status: false, result: "Bad email format" }
        } */
        let user = await User.findOne({ username })
        if (!user) {
            return { status: false, result: "No user with the username " + username + " found" }
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
        console.log("removeRefresh", username)
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
        console.log(currentUsername, targetUsername)
        if (currentUsername === targetUsername) {
            return { status: false, result:  "You can't follow yourself!" }
        }
        let currentUser = await User.findOne({ username: currentUsername })
        if (!currentUser) {
            return { status: false, result:  "Current user is not found"  }
        }
        let targetUser = await User.findOne({ username: targetUsername })
        if (!targetUser) {
            return { status: false, result: "There is no such user"  }
        }
        try {
            currentUser.following.push(targetUser)
            targetUser.followers.push(currentUser)
            currentUser.save()
            targetUser.save()
            return { status: true, result: "You followed " + targetUsername  }
        }
        catch (e) {
            return { status: false, result: e.message  }
        }
    }


    const unfollowUser = async (currentUsername, targetUsername) => {
        let currentUser = await User.findOne({ username: currentUsername })
        if (!currentUser) {
            return { status: false, result:  "Current user is not found" }
        }
        let targetUser = await User.findOne({ username: targetUsername })
        if (!targetUser) {
            return { status: false, result: "There is no such user" }
                }
        if (!currentUser.following.includes(targetUser._id)) {
            return { status: false, result: { message: "You are not following " + targetUsername + ". Follow first before unfollowing." } }
        }
        try {
            await User.updateOne({ username: currentUsername }, { $pull: { following: targetUser._id } })
            await User.updateOne({ username: targetUsername }, { $pull: { followers: currentUser._id } })
            return { status: true, result:   "You unfollowed " + targetUsername  }
        }
        catch (e) {
            console.log(e)
            return { status: false, result: { message: e.message } }
        }
    }


    const getFollowers = async (username) => {
        let user = await User.findOne({ username })
        if (user) {
            return { status: true, result: user.followers }
        }
        else {
            return { status: false, result: "User not found"  }
        }
    }

    const getFollowing = async (username) => {
        let user = await User.findOne({ username })
        // console.log("getFollowing" ,user)
        if (user) {
            return { status: true, result: user.following }
        }
        else {
            return { status: false, result: "User not found"  }
        }
    }



    const getUsers = async (username) => {
        let userID = await User.findOne({ username })
        let user = await User.find({ followers: { $nin: [userID] } }).limit(6)
        let users= user.filter((item)=>item.username!==username)
        console.log(" list " , users)
        if (users) {
            return { status: true, result: users }
        }
        else {
            return { status: false, result:  "User not found"  }
        }
    }

    const getUser = async (username) => {
        let user = await User.findOne({ username })

        console.log(" list " , user)
        if (user) {
            return { status: true, result: user }
        }
        else {
            return { status: false, result:  "User not found"  }
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
        getFollowers,
        getFollowing,
        getUsers,
        getUser
    }