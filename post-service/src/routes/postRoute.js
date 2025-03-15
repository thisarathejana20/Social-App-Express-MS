const express = require("express");
const authenticationRequest = require("../middleware/authMiddleware");
const {
  createPost,
  getAllPosts,
  getPost,
  deletePost,
} = require("../controller/PostController");

const postRouter = express.Router();

postRouter.use(authenticationRequest);

postRouter.post("/", createPost);
postRouter.get("/", getAllPosts);
postRouter.get("/:id", getPost);
postRouter.get("/:id", deletePost);

module.exports = postRouter;
