require("dotenv").config();
const express = require("express")
const mongoose = require("mongoose")
const morgan = require("morgan")
const authRouter = require("./routes/auth")
const cors = require('cors')

const userController = require("./controllers/userController")

const jwt = require("jsonwebtoken")

const app = express();
// console.log(process.env.NAME)

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
}).then(() => console.log("Connected to mongodb"))

app.use(morgan("dev"))
app.use(express.json());
app.use(cors());

let verifyToken = async (req, res, next) => {
    let header = req.headers["authorization"]
    if (!header) {
        res.status(403).send({ message: "Need authorization header" })
    }
    let access_token = header.split(" ")[1]
    if (!access_token) {
        res.status(403).send({ message: "Need access token" })
    }
    try {
        let user = jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET)
        next()
    }
    catch (e) {
        res.status(403).send({ message: "Inavalid access token" })
    }
}

app.use("/auth", authRouter)
// app.use("/posts", verifyToken, postRouter)

app.get('/followers', verifyToken, async (req, res) => {
    let header = req.headers["authorization"]
    let access_token = header.split(" ")[1]
    let user = jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET)
    let result = await userController.getFollowers(user.username)
    if (result.status) {
        res.status(200).send(result.result)
    }
    else {
        res.status(401).send(result.result)
    }
})

app.get('/following', verifyToken, async (req, res) => {
    let header = req.headers["authorization"]
    let access_token = header.split(" ")[1]
    let user = jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET)
    let result = await userController.getFollowing(user.username)
    if (result.status) {
        res.status(200).send(result.result)
    }
    else {
        res.status(401).send(result.result)
    }
})

app.post('/follow/:username', verifyToken, async (req, res) => {
    let header = req.headers["authorization"]
    let access_token = header.split(" ")[1]
    let user = jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET)
    let result = await userController.followUser(user.username, req.params.username)
    if (result.status) {
        res.status(201).send(result.result)
    }
    else {
        res.status(401).send(result.result)
    }
})

app.post('/unfollow/:username', verifyToken, async (req, res) => {
    let header = req.headers["authorization"]
    let access_token = header.split(" ")[1]
    let user = jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET)
    let result = await userController.unfollowUser(user.username, req.params.username)
    if (result.status) {
        res.status(201).send(result.result)
    }
    else {
        res.status(401).send(result.result)
    }
})

app.post('/block/:username', verifyToken, async (req, res) => {
    let header = req.headers["authorization"]
    let access_token = header.split(" ")[1]
    let user = jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET)
    let result = await userController.blockUser(user.username, req.params.username)
    if (result.status) {
        res.status(201).send(result.result)
    }
    else {
        res.status(401).send(result.result)
    }
})

app.get("/", (req, res) => {
    res.send("welcome")
})

const PORT = 3300
app.listen(PORT, () => console.log("Server listening to", PORT))