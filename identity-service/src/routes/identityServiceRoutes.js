const express = require("express");
const { registerUser } = require("../controllers/identityController");

const authRouter = express.Router();

// Define a GET route to retrieve all records

// router.get("/", );

// Define a GET route to retrieve a single record by ID

// router.get("/:id");

// Define a POST route to create a new record
authRouter.post("/register", registerUser);

module.exports = authRouter;
