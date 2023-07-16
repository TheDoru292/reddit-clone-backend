const express = require("express");
const passport = require("passport");
const router = express.Router();
require("../passport");

const checks = require("../lib/checks");
const helper = require("../lib/helper");
const mod = require("../controllers/modController");

router.post(
  "/:redditName/postflair",
  passport.authenticate("jwt", { session: false }),
  helper.checkSubredditExistsAndGetId,
  checks.checkUserIsSubredditMod,
  mod.createPostFlair
);

router.delete(
  "/:redditName/postflair/:flairName",
  passport.authenticate("jwt", { session: false }),
  helper.checkSubredditExistsAndGetId,
  checks.checkUserIsSubredditMod,
  checks.checkPostFlairExists,
  mod.deletePostFlair
);

router.delete(
  "/:redditName/post/:postId",
  passport.authenticate("jwt", { session: false }),
  helper.checkSubredditExistsAndGetId,
  checks.checkUserIsSubredditMod,
  mod.deletePost
);

module.exports = router;
