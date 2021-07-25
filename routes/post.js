const express = require("express")
const postController = require("../controllers/postController")
const jwt = require("jsonwebtoken")

const router = express.Router()

router.get("/", async (req, res) => {
    let header = req.headers["authorization"]
    let access_token = header.split(" ")[1]
    let user = jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET)
    let result = await postController.getPosts(user.username)
    if (result.status) {
        //   console.log ("RESULT :" ,result.result)
        res.status(201).send(result.result)
    }
    else {
        res.status(401).send(result.result)
    }
})

router.post("/", async (req, res) => {

    let header = req.headers["authorization"]
    console.log ("Route .." ,req.body , req.headers["authorization"])
    let access_token = header.split(" ")[1]
    let user = jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET)
    let result = await postController.createPost(user.username, req.body)
    if (result.status) {
        console.log ("RESULT :" ,result.result)
        res.status(201).json(result.result)
    }
    else {
        console.log ("ERROR RESULT:" ,result.result)
        res.status(401).json(result.result)
    }
})

router.get("/:id", async (req, res) => {
    let header = req.headers["authorization"]
    let access_token = header.split(" ")[1]
    let user = jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET)
    let result = await postController.getPost(user.username, req.params.id)
    if (result.status) {
        res.status(201).send(result.result)
    }
    else {
        res.status(401).send(result.result)
    }
})


router.delete("/:id", async (req, res) => {
    let header = req.headers["authorization"]
    let access_token = header.split(" ")[1]
    let user = jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET)
    let result = await postController.deletePost(user.username, req.params.id)
    if (result.status) {
        res.status(201).send(result.result)
    }
    else {
        res.status(401).send(result.result)
    }
})



module.exports = router