const logger = require("../utils/logger");

const authenticationRequest = (req, res, next) => {
  const userId = req.headers["x-user-id"];
  if (!userId) {
    logger.warn("No user ID provided in the request");
    return res.status(401).json({ message: "Unauthorized" });
  }
  req.user = { userId };
  next();
};

module.exports = authenticationRequest;
