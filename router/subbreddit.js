const express = require('express');
const router = express.Router();

const passport = require('passport');
require('../passport');

const checks = require('../lib/checks');
const subreddit = require('../controllers/subredditController');

router.post(
  '/',
  passport.authenticate('jwt', {session: false}),
  checks.checkSubredditAvailability,
  subreddit.createSubreddit
);

module.exports = router;