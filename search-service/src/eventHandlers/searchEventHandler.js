const Search = require("../models/Search");
const logger = require("../utils/logger");

const handlePostCreated = async (event) => {
  try {
    const post = new Search({
      postId: event.postId,
      userId: event.userId,
      content: event.content,
      createdAt: event.createdAt,
    });

    await post.save();
    logger.info("Saved search data for post:", event.postId);
  } catch (error) {
    logger.error("Error handling post created event:", error);
  }
};

const handlePostDeleted = async (event) => {
  try {
    await Search.deleteOne({ postId: event.postId });
    logger.info("Deleted search data for post:", event.postId);
  } catch (error) {
    logger.error("Error handling post deleted event:", error);
  }
};

module.exports = { handlePostCreated, handlePostDeleted };
