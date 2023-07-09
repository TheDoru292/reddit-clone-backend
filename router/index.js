const express = require("express");
const router = express.Router();
require("../passport");

const authRouter = require("./auth");

const subredditRouter = require("./subbreddit");

router.use("/auth", authRouter);

router.use("/subreddit", subredditRouter);

module.exports = router;
