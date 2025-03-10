const express = require("express");
require("dotenv").config();
const helmet = require("helmet");
const Redis = require("ioredis");
const cors = require("cors");
const logger = require("./utils/logger");
const connectToDatabase = require("./database/mongoConnect");
const postRouter = require("./routes/postRoute");
const errorHandler = require("./utils/errorHandler");

const app = express();

connectToDatabase();

app.use(helmet());

app.use(cors());

app.use(express.json());

const redisClient = new Redis(process.env.REDIS_URL);

// for logging purposes
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  logger.debug(`Request body: ${JSON.stringify(req.body)}`);
  next();
});

// rate limit

// routes
app.use(
  "api/posts",
  (req, res, next) => {
    req.redisClient = redisClient;
    next();
  },
  postRouter
);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Post Service Server running on port ${PORT}`);
});

//unhandled promises
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", reason);
  process.exit(1);
});
