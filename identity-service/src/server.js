const express = require("express");
const connectToDatabase = require("./database/mongoConnect");
require("dotenv").config();
const cors = require("cors");
const helmet = require("helmet");
const logger = require("./utils/logger");
const { RateLimiterRedis } = require("rate-limiter-flexible");
const Redis = require("ioredis");
const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const authRouter = require("./routes/identityServiceRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// connect to database
connectToDatabase();

// connect to redis client
const redisClient = new Redis(process.env.REDIS_URL);

// middleware
app.use(express.json());
app.use(helmet());

// enable CORS

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};

app.use(cors(corsOptions));

// for logging purposes
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  logger.debug(`Request body: ${JSON.stringify(req.body)}`);
  next();
});

// ddos protection and rate limiting
const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "middleware",
  points: 10, // 10 requests per minute,
  duration: 60, // 1 minute
});

app.use((req, res, next) => {
  rateLimiter
    .consume(req.ip)
    .then(() => {
      next();
    })
    .catch(() => {
      res.status(429).json({
        success: false,
        message: "Too many requests, please try again later.",
      });
    });
});

// ip based rate limiting for sensitive endpoints
const sensitiveEndpointsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per windowMs
  standardHeaders: true, // client will receive a notice also about how many requests left
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn("Sensitive endpoint rate limit exceeded");
    res.status(429).json({
      success: false,
      message: "Too many requests from this IP, please try again later.",
    });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

// routes
app.use("/api/auth/register", sensitiveEndpointsLimiter);
app.use("/api/auth", authRouter);

// error handlers
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Identity Service Server running on port ${PORT}`);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", reason);
  process.exit(1);
});
