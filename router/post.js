const express = require("express");
const router = express.Router();
const passport = require("passport");
require("../passport");

const checks = require("../lib/checks");
const helper = require("../lib/helper");
const like = require("../controllers/likeController");
const post = require("../controllers/postController");
const poll = require("../controllers/pollController");

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

router.put(
  "/:postId",
  passport.authenticate("jwt", { session: false }),
  helper.checkPostExistsAndGetSubreddit,
  checks.checkUserIsOp,
  checks.checkPostIsNotUrl,
  post.editPost
);

router.delete(
  "/:postId",
  passport.authenticate("jwt", { session: false }),
  helper.checkPostExistsAndGetSubreddit,
  checks.checkUserIsOp,
  post.deletePost
);

router.put(
  "/:postId/upvote",
  passport.authenticate("jwt", { session: false }),
  helper.checkPostExistsAndGetSubreddit,
  (req, res, next) => {
    req.upvotePost = true;
    req.viewOnly = true;
    next();
  },
  checks.checkSubredditTypeAndUserPerms,
  checks.checkPostUpvotedOrDownvoted,
  like.upvotePost
);

router.delete(
  "/:postId/upvote",
  passport.authenticate("jwt", { session: false }),
  helper.checkPostExistsAndGetSubreddit,
  (req, res, next) => {
    req.upvotePost = false;
    req.viewOnly = true;
    next();
  },
  checks.checkSubredditTypeAndUserPerms,
  checks.checkPostUpvotedOrDownvoted,
  like.removePostUpvote
);

router.put(
  "/:postId/downvote",
  passport.authenticate("jwt", { session: false }),
  helper.checkPostExistsAndGetSubreddit,
  (req, res, next) => {
    req.upvotePost = false;
    req.viewOnly = true;
    next();
  },
  checks.checkSubredditTypeAndUserPerms,
  checks.checkPostUpvotedOrDownvoted,
  like.downvotePost
);

router.delete(
  "/:postId/downvote",
  passport.authenticate("jwt", { session: false }),
  helper.checkPostExistsAndGetSubreddit,
  (req, res, next) => {
    req.upvotePost = false;
    req.viewOnly = true;
    next();
  },
  checks.checkSubredditTypeAndUserPerms,
  checks.checkPostUpvotedOrDownvoted,
  like.removePostDownvote
);

router.post(
  "/:postId/poll/:pollOption",
  passport.authenticate("jwt", { session: false }),
  helper.checkPostExistsAndGetSubreddit,
  (req, res, next) => {
    req.vote = true;
    req.viewOnly = true;
    next();
  },
  checks.checkSubredditTypeAndUserPerms,
  checks.checkPollAndOptionExists,
  checks.checkUserAlreadyVoted,
  poll.votePoll
);

module.exports = router;
