const mongoose = require("mongoose");
const logger = require("../utils/logger");

// Connect to MongoDB
const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    logger.info("Connected to MongoDB successfully");
  } catch (error) {
    logger.error("Failed to connect to MongoDB:", error.message);
    process.exit(1);
  }
};

module.exports = connectToDatabase;
