const express = require("express");
const {
  registerUser,
  loginUser,
  refreshToken,
  logOutUser,
} = require("../controllers/identityController");

const authRouter = express.Router();

authRouter.post("/login", loginUser);
authRouter.post("/register", registerUser);
authRouter.post("/refresh-token", refreshToken);
authRouter.post("/logout", logOutUser);

module.exports = authRouter;
