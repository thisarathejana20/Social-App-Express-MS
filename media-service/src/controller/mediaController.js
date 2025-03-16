const Media = require("../models/Media");
const { uploadMediaToCloudinary } = require("../utils/cloudinary");
const logger = require("../utils/logger");

const uploadMedia = async (req, res) => {
  logger.info("Uploading media endpoint");
  try {
    if (!req.file) {
      logger.error("No file to upload");
      return res
        .status(400)
        .json({ success: false, message: "No file provided" });
    }

    const { originalname, mimetype, buffer } = req.file;
    const userId = req.user.userId;

    logger.info(`File details: name: ${originalname} mime-type: ${mimetype}`);
    logger.info("Uploading file to cloudinary started");
    const result = await uploadMediaToCloudinary(req.file);
    logger.info("File uploaded to cloudinary successfully");

    const newFileData = new Media({
      postId: result.public_id,
      originalName: originalname,
      mimeType: mimetype,
      url: result.secure_url,
      userId,
    });

    await newFileData.save();

    res.json({
      success: true,
      message: "File uploaded successfully",
      mediaId: newFileData._id,
      url: newFileData.url,
    });
  } catch (error) {
    logger.error("Error uploading media", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload media",
      error: error.message,
    });
  }
};

const getAllMedia = async (req, res) => {
  logger.info("Getting all media endpoint");
  try {
    const media = await Media.find({});
    res.json({ success: true, media });
  } catch (error) {
    logger.error("Error retrieving media", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve media",
      error: error.message,
    });
  }
};

module.exports = { uploadMedia, getAllMedia };
