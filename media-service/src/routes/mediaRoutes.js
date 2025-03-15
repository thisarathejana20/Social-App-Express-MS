const express = require("express");
const multer = require("multer");
const authenticationRequest = require("../middleware/authMiddleware");
const { uploadMedia } = require("../controller/mediaController");
const logger = require("../utils/logger");

const mediaRouter = express.Router();

// configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 50, // 50MB
  },
}).single("file");

mediaRouter.post(
  "/upload",
  authenticationRequest,
  (req, res, next) => {
    upload(req, res, function (err) {
      console.log("Request completed...");
      if (err instanceof multer.MulterError) {
        logger.error("Multer error", err);
        return res.status(400).json({ success: false, message: err.message });
      } else if (err) {
        logger.error("Unknown error", err);
        return res.status(500).json({ success: false, message: err.message });
      }

      if (!req.file) {
        logger.error("No file uploaded");
        return res
          .status(400)
          .json({ success: false, message: "No file uploaded" });
      }
      next();
    });
  },
  uploadMedia
);

module.exports = mediaRouter;
