const RefreshToken = require("../models/RefreshToken");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const logger = require("../utils/logger");
const {
  validatingUserRegistration,
  validateLogin,
} = require("../utils/validation");
const argon2 = require("argon2");

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

const loginUser = async (req, res, next) => {
  try {
    const { error } = validateLogin(req.body);
    if (error) {
      logger.warn("Validation failed", error.details[0].message);
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      logger.warn("Invalid credentials");
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await argon2.verify(user.password, password);
    if (!isMatch) {
      logger.warn("Invalid Password");
      return res
        .status(401)
        .json({ success: false, message: "Invalid password" });
    }
    logger.info("User logging in", isMatch);

    const { accessToken, refreshToken } = await generateToken(user);
    res.json({
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken,
      userId: user._id,
    });
  } catch (error) {
    logger.error("Login error occurred");
    res.status(500).json({ success: false, error: error });
  }
};

const refreshToken = async (req, res, next) => {
  logger.info("Refresh token endpoint");
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.warn("No refresh token provided");
      return res
        .status(401)
        .json({ success: false, message: "No refresh token" });
    }
    const storedToken = await RefreshToken.findOne({
      token: refreshToken,
    });
    if (!storedToken || storedToken.expiresAt < new Date()) {
      logger.warn("Invalid or expired refresh token");
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired refresh token" });
    }

    const user = await User.findById(storedToken.user);
    if (!user) {
      logger.warn("User not found");
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await generateToken(user);

    // delete old tokens
    await RefreshToken.deleteOne({ _id: storedToken._id });
    return res.json({
      success: true,
      message: "Refresh successful",
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    logger.error("Refresh token error occurred", error);
    res.status(500).json({ success: false, error: error });
  }
};

const logOutUser = async (req, res, next) => {
  logger.info("Logout endpoint");
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.warn("No refresh token provided");
      return res
        .status(401)
        .json({ success: false, message: "No refresh token" });
    }
    await RefreshToken.deleteOne({ token: refreshToken });
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    logger.error("Logout error occurred", error);
    res.status(500).json({ success: false, error: error });
  }
};

module.exports = { registerUser, loginUser, refreshToken, logOutUser };
