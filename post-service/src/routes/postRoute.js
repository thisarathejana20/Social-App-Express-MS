const express = require("express");
const authenticationRequest = require("../middleware/authMiddleware");
const { createPost } = require("../controller/PostController");

const postRouter = express.Router();

postRouter.use(authenticationRequest);

postRouter.post("/", createPost);

module.exports = postRouter;
