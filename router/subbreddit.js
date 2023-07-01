const express = require('express');
const router = express.Router();

const passport = require('passport');
require('../passport');

const checks = require('../lib/checks');
const helper = require('../lib/helper');
const subreddit = require('../controllers/subredditController');
const post = require('../controllers/postController');

router.post(
  '/',
  passport.authenticate('jwt', {session: false}),
  checks.checkSubredditAvailability,
  subreddit.createSubreddit
);

router.get(
  '/:redditName',
  passport.authenticate('jwt', {session: false}),
  helper.checkSubredditExistsAndGetId,
  subreddit.getSubreddit
);

router.post(
  '/:redditName/post',
  passport.authenticate('jwt', {session: false}),
  helper.checkSubredditExistsAndGetId,
  checks.checkSubredditTypeAndUserPerms,
  post.createPost
);

module.exports = router;