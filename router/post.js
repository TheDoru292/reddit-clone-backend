const express = require("express");
const router = express.Router();
const passport = require("passport");
require("../passport");

const checks = require("../lib/checks");
const helper = require("../lib/helper");
const like = require("../controllers/likeController");
const post = require("../controllers/postController");

router.get(
  "/:postId",
  passport.authenticate("jwt", { session: false }),
  helper.checkPostExistsAndGetSubreddit,
  (req, res, next) => {
    req.viewOnly = true;
    next();
  },
  checks.checkSubredditTypeAndUserPerms,
  post.getPost
);

module.exports = router;
