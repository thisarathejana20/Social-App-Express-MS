const express = require("express");
const authenticationRequest = require("../middleware/authMiddleware");
const { searchPost } = require("../controller/searchPostController");

const searchRouter = express.Router();

searchRouter.use(authenticationRequest);

searchRouter.get("/posts", searchPost);

module.exports = searchRouter;
