const express = require("express");
const router = express.Router();
require("../passport");

const authRouter = require("./auth");
const subredditRouter = require("./subbreddit");
const modRouter = require("./mod");

router.use("/auth", authRouter);

router.use("/subreddit", subredditRouter);

router.use("/mod", modRouter);

module.exports = router;
