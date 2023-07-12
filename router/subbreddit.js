const express = require("express");
const router = express.Router();

const passport = require("passport");
require("../passport");

const checks = require("../lib/checks");
const helper = require("../lib/helper");
const subreddit = require("../controllers/subredditController");
const post = require("../controllers/postController");

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  checks.checkSubredditAvailability,
  subreddit.createSubreddit
);

router.get(
  "/:redditName",
  passport.authenticate("jwt", { session: false }),
  helper.checkSubredditExistsAndGetId,
  (req, res, next) => {
    req.viewOnly = true;
    next();
  },
  checks.checkSubredditTypeAndUserPerms,
  subreddit.getSubreddit
);

router.post(
  "/:redditName/post",
  passport.authenticate("jwt", { session: false }),
  helper.checkSubredditExistsAndGetId,
  checks.checkSubredditTypeAndUserPerms,
  post.createPost
);

router.get(
  "/:redditName/postflair",
  helper.checkSubredditExistsAndGetId,
  (req, res, next) => {
    req.viewOnly = true;
    next();
  },
  checks.checkSubredditTypeAndUserPerms,
  subreddit.getPostFlairs
);

module.exports = router;
