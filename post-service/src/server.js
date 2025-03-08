const express = require("express");
require("dotenv").config();
const helmet = require("helmet");
const Redis = require("ioredis");
const cors = require("cors");
const logger = require("./utils/logger");
const connectToDatabase = require("./database/mongoConnect");

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
