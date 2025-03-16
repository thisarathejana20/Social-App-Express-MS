const logger = require("../utils/logger");
const Media = require("../models/Media");
const { deleteMediaFromCloudinary } = require("../utils/cloudinary");

const handlePostDeletedEvent = async (event) => {
  console.log("Event received:", event);
  const { postId, mediaIds } = event;
  try {
    const mediaToDelete = await Media.find({ _id: { $in: mediaIds } });

    for (const media of mediaToDelete) {
      await deleteMediaFromCloudinary(media.postId);
      await Media.findByIdAndDelete(media._id);
      logger.info("Deleted media:", media.originalName);
    }
  } catch (error) {
    logger.error("Failed to handle post deleted event:", error.message);
  }
};

module.exports = handlePostDeletedEvent;
