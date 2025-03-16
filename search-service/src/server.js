const express = require("express");
require("dotenv").config();
const helmet = require("helmet");
const Redis = require("ioredis");
const cors = require("cors");
const logger = require("./utils/logger");
const connectToDatabase = require("./database/mongoConnect");
const errorHandler = require("./middleware/errorHandler");
const { connectToRabbitMQ, consumeEvent } = require("./utils/rabbitmq");
const searchRouter = require("./routes/searchRoute");
const {
  handlePostCreated,
  handlePostDeleted,
} = require("./eventHandlers/searchEventHandler");

const app = express();

// connect to database
connectToDatabase();

const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use(helmet());

app.use(cors());

app.use("/api/search", searchRouter);

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectToRabbitMQ();
    // consume all the events
    await consumeEvent("post.created", handlePostCreated);
    await consumeEvent("post.deleted", handlePostDeleted);

    app.listen(PORT, () => {
      logger.info(`Search Service Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to connect to RabbitMQ", error);
    process.exit(1);
  }
};

startServer();

// unhandled promises
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", reason);
  process.exit(1);
});
