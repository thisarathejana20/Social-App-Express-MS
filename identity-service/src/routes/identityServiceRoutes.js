const express = require("express");
const { registerUser } = require("../controllers/identityController");

const router = express.Router();

// Define a GET route to retrieve all records

// router.get("/", );

// Define a GET route to retrieve a single record by ID

// router.get("/:id");

// Define a POST route to create a new record
router.post("/register", registerUser);

module.exports = router;
