const express = require("express");
require("dotenv").config();
const helmet = require("helmet");
const cors = require("cors");
const connectToDatabase = require("./database/mongoConnect");
const mediaRouter = require("./routes/mediaRoutes");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");

const app = express();

// Connect to MongoDB
connectToDatabase();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors());

const PORT = process.env.PORT || 5000;

// routes
app.use("/api/media", mediaRouter);

app.use(errorHandler);

app.listen(PORT, () => logger.info(`Media Service running on port ${PORT}`));

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", reason);
  process.exit(1);
});
