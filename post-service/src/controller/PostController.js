const { json } = require("express");
const Post = require("../models/Post");
const logger = require("../utils/logger");
const { invalidateGetPosts } = require("../utils/redisHelper");
const validateCreatePost = require("../utils/validation");
const { publishEvent } = require("../utils/rabbitmq");
const { mongoose } = require("mongoose");

const createPost = async (req, res, next) => {
  // validate
  const { error } = validateCreatePost(req.body);
  if (error) {
    logger.error("Validation failed", error);
    return res.status(400).json({ success: false, message: error.message });
  }
  try {
    const { content, mediaIds, title } = req.body;
    const post = new Post({
      title,
      author: req.user.userId,
      content,
      mediaIds: mediaIds || [],
    });
    await post.save();

    // invalidate old redis cache
    invalidateGetPosts(req, post);

    // publish event to notify other services
    await publishEvent("post.created", {
      postId: post._id.toString(),
      userId: req.user.userId,
      content: post.content,
      createdAt: post.createdAt,
    });

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

const getPost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const cacheKey = `post:${postId}`;
    const cachedPost = await req.redisClient.get(cacheKey);
    if (cachedPost) {
      return res.json(JSON.parse(cachedPost));
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    await req.redisClient.setex(cacheKey, 3600, JSON.stringify(post));
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
    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      author: new mongoose.Types.ObjectId(req.user.userId),
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // publish an event to rabbitMQ server that delete the media associated with the post
    await publishEvent("post.deleted", {
      postId: post._id.toString(),
      userId: req.user.userId,
      mediaIds: post.mediaIds,
    });

    await invalidateGetPosts(req, req.params.id);
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

const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * pageSize;

    // check the redis cache
    const cacheKey = `posts:page:${page}:limit:${pageSize}`;
    const cachedPosts = await req.redisClient.get(cacheKey);

    if (cachedPosts) {
      return res.json(JSON.parse(cachedPosts));
    }

    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(pageSize);

    const total = await Post.countDocuments();

    const result = {
      posts,
      total,
      currentPage: page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };

    // save to redis cache
    await req.redisClient.setex(cacheKey, 3600, JSON.stringify(result));

    res.json(result);
  } catch (error) {
    logger.error("Error retrieving posts from cache", error);
  }
};

module.exports = { getAllPosts, createPost, getPost, deletePost };
