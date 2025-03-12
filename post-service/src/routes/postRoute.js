const express = require("express");
const authenticationRequest = require("../middleware/authMiddleware");
const { createPost, getAllPosts } = require("../controller/PostController");

const postRouter = express.Router();

postRouter.use(authenticationRequest);

postRouter.post("/", createPost);
postRouter.get("/", getAllPosts);

module.exports = postRouter;
