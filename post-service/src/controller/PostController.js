const Post = require("../models/Post");
const logger = require("../utils/logger");

const createPost = async (req, res, next) => {
  try {
    const { content, mediaIds } = req.body;
    const post = new Post({
      user: req.user.userId,
      content,
      mediaIds: mediaIds || [],
    });
    await post.save();
    logger.info("Post created successfully");
    res.status(201).json({ success: true, message: "Success" });
  } catch (error) {
    logger.error("Error creating post", error);
    res.status(500).json({
      success: false,
      message: "Failed to create post",
      error: error.message,
    });
  }
};

const getAll = async (req, res, next) => {
  try {
    const posts = await Post.find({});
    res.json(posts);
  } catch (error) {
    logger.error("Error retrieving posts", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve posts",
      error: error.message,
    });
  }
};

const getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    res.json(post);
  } catch (error) {
    logger.error("Error retrieving post", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve post",
      error: error.message,
    });
  }
};

const deletePost = async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Post deleted" });
  } catch (error) {
    logger.error("Error deleting post", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete post",
      error: error.message,
    });
  }
};

module.exports = { createPost, getAll, getPost, deletePost };
