const express = require("express")
const userController = require("../controllers/userController")
const jwt = require("jsonwebtoken")

const router = express.Router()

router.post("/signup", async (req, res) => {
    let result = await userController.createUser(req.body)
    if (result.status) {
        res.status(201).send(result.result)
    }
    else {
        res.status(401).send(result.result)
    }
})

router.post("/signin", async (req, res) => {
    let result = await userController.validateUser(req.body)
    if (result.status) {
        let payload = {
            username: result.result.username
        }
        let access_token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_TIME })
        let refresh_token = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_TIME })
        let resp= await userController.addRefresh(result.result.username, refresh_token)
        console.log(resp.status ,resp.result, access_token, refresh_token)
        res.status(201).send({ access_token, refresh_token })
    }
    else {
        console.log(result.result)
        res.status(401).send(result.result)
    }
})

router.post("/signout", async (req, res) => {
    let header = req.headers["authorization"]
    if (!header) {
        res.status(403).send({ message: "Need authorization header" })
    }
    let access_token = header.split(" ")[1]
    try {
        let user = jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET)
        let result = await userController.removeRefresh(user.username)
        if (result.status) {
            res.status(200).send(result.result)
        }
        else {
            res.status(401).send(result.result)
        }
    }
    catch (e) {
        res.status(403).send({ message: "Inavalid access token" })
    }
})

router.post("/token", async (req, res) => {
    let { refresh_token } = req.body
    try {
        let user = jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET)
        let result = await userController.validateRefresh(user.username, refresh_token)
        if (result.status) {
            let access_token = jwt.sign({ username: user.username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRE })
            res.status(200).send({ access_token })
        }
        else {
            res.status(403).send({ message: "Invalid refresh token" })
        }
    }
    catch (e) {
        res.status(403).send({ message: "Inavalid refresh token" })
    }
})

module.exports = router