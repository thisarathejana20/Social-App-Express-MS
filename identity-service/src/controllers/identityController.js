const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const logger = require("../utils/logger");
const { validatingUserRegistration } = require("../utils/validation");

const registerUser = async (req, res, next) => {
  logger.info("Registering user");
  try {
    //validate
    const { error } = validatingUserRegistration(req.body);
    if (error) {
      logger.warn("Validation failed", error.details[0].message);
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const { username, email, password } = req.body;

    let user = await User.findOne({ $or: [{ username }, { email }] });
    if (user) {
      logger.warn("User already registered");
      return res
        .status(400)
        .json({ success: false, message: "User already registered" });
    }

    user = new User({ username, email, password });
    await user.save();
    logger.info("User registered successfully");
    const { accessToken, refreshToken } = await generateToken(user);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { registerUser };
