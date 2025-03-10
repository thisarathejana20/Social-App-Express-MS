require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const Redis = require("ioredis");
const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const logger = require("./utils/logger");
const proxy = require("express-http-proxy");
const errorHandler = require("./middleware/errorHandler");
const { validateToken } = require("./utils/authMiddleware");

const app = express();

app.use(helmet());

app.use(cors());

app.use(express.json());

const redisClient = new Redis(process.env.REDIS_URL);

//rate limit
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 10 requests per windowMs
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

app.use(rateLimiter);

// for logging purposes
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  logger.debug(`Request body: ${JSON.stringify(req.body)}`);
  next();
});

const PORT = process.env.PORT || 5000;

// api gateway receive request like ===>> localhost:3000/v1/auth/register
// it will replace the v1 path with api
const proxyOptions = {
  proxyReqPathResolver: (req) => {
    return req.originalUrl.replace(/^\/v1/, "/api");
  },
  proxyErrorHandler: (err, res, next) => {
    logger.error("Proxy error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  },
};

app.use(
  "/v1/auth",
  proxy(process.env.IDENTITY_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["Content-Type"] = "application/json";
      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from Identity Server : ${proxyRes.statusCode}`
      );
      return proxyResData;
    },
  })
);

// setting up proxy for post service
app.use(
  "/v1/posts",
  validateToken,
  proxy(process.env.POST_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["Content-Type"] = "application/json";
      // now here we need the user id set to headers. because in the post service we access it from the headers
      // here srcReq is populated with current req object. because of previous middleware validateToken req object has user information
      proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from Post Server : ${proxyRes.statusCode}`
      );
      return proxyResData;
    },
  })
);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`API gateway is running on port: ${PORT}`);
  logger.info(
    `Identity Service is running on: ${process.env.IDENTITY_SERVICE_URL}`
  );
  logger.info(`Post Service is running on: ${process.env.POST_SERVICE_URL}`);
});
