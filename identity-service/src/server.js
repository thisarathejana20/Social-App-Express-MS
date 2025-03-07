const express = require("express");
const connectToDatabase = require("./database/mongoConnect");
require("dotenv").config();

const app = express();

// connect to database
connectToDatabase();

app.use(express.json());
