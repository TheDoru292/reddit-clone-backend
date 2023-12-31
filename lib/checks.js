const conn = require("../services/db");
const async = require("async");

exports.checkSubredditAvailability = (req, res, next) => {
  conn
    .promise()
    .query("SELECT * FROM Subreddit WHERE name = ?", [req.body.name])
    .then((subreddit) => {
      if (subreddit[0].length != 0) {
        return next("SUBREDDIT_EXISTS");
      } else {
        next();
      }
    })
    .catch((err) => {
      return next(err);
    });
};

exports.checkSubredditTypeAndUserPerms = (req, res, next) => {
  if (req.subreddit.type == "pub") {
    next();
  } else if (req.subreddit.type == "res" && !req.viewOnly) {
    conn
      .promise()
      .query(
        `SELECT id FROM Members_from_restricted_subreddits
      WHERE subreddit = ? AND user = ?`,
        [req.subreddit.id, req.user.id]
      )
      .then((user) => {
        if (user[0].length == 0) {
          return next("INVALID_PERMS");
        }

        next();
      })
      .catch((err) => {
        return next(err);
      });
  } else {
    conn
      .promise()
      .query(
        `SELECT id FROM Private_members
      WHERE subreddit = ? AND user = ?`,
        [req.subreddit.id, req.user.id]
      )
      .then((user) => {
        if (user[0].length == 0) {
          return next("INVALID_PERMS");
        }

        return next();
      })
      .catch((err) => {
        return next(err);
      });
  }
};

exports.checkUserIsSubredditMod = (req, res, next) => {
  conn
    .promise()
    .query(
      `
    SELECT * FROM Moderators WHERE user = ? AND subreddit = ?
    `,
      [req.user.id, req.subreddit.id]
    )
    .then((mod) => {
      if (mod[0][0].id) {
        next();
      } else {
        next("NO_PERMS");
      }
    })
    .catch((err) => {
      next(err);
    });
};

exports.checkPostFlairExists = (req, res, next) => {
  conn
    .promise()
    .query(`SELECT * FROM Subreddit_flairs WHERE name = ? AND subreddit = ?`, [
      req.params.flairName,
      req.subreddit.id,
    ])
    .then((flair) => {
      if (!flair[0][0]) {
        return next("NOT_FOUND");
      }

      next();
    })
    .catch((err) => {
      return next(err);
    });
};

exports.checkPostUpvotedOrDownvoted = (req, res, next) => {
  async.waterfall(
    [
      function (cb) {
        conn
          .promise()
          .query(`SELECT * FROM Post_upvotes WHERE user = ? AND post = ?`, [
            req.user.id,
            req.params.postId,
          ])
          .then((upvote) => {
            if (upvote[0].length == 0) {
              req.postUpvoted = false;
            } else {
              req.postUpvoted = true;
            }

            cb(null);
          })
          .catch((err) => {
            cb(err);
          });
      },
      function (cb) {
        conn
          .promise()
          .query(`SELECT * FROM Post_downvotes WHERE user = ? AND post = ?`, [
            req.user.id,
            req.params.postId,
          ])
          .then((downvote) => {
            if (downvote[0].length == 0) {
              req.postDownvoted = false;
            } else {
              req.postDownvoted = true;
            }

            cb(null);
          })
          .catch((err) => {
            cb(err);
          });
      },
    ],
    (err, result) => {
      if (err) {
        return next(err);
      }

      next();
    }
  );
};

exports.checkUserIsOp = (req, res, next) => {
  if (req.subreddit.user == req.user.id) {
    next();
  } else {
    return next("NOT_OP");
  }
};

exports.checkPostIsNotUrl = (req, res, next) => {
  conn
    .promise()
    .query(`SELECT * FROM Posts WHERE id = ?`, [req.params.postId])
    .then((post) => {
      if (post[0][0].type == "url") {
        return next("URL_TYPE");
      } else {
        next();
      }
    })
    .catch((err) => {
      return next(err);
    });
};

exports.checkPollAndOptionExists = (req, res, next) => {
  conn
    .promise()
    .query(`SELECT * FROM Polls WHERE post = ?`, [req.params.postId])
    .then((poll) => {
      if (poll[0].length == 0) {
        return next("POLL_NOT_FOUND");
      }

      if (req.vote == true) {
        let difference = new Date() - new Date(poll[0][0].ends_in);
        req.pollId = poll[0][0].id;

        if (difference > 0) {
          return next("POLL_ENDED");
        }

        const [pollOption] = req.params.pollOption;
        const { option_1, option_2, option_3, option_4, option_5, option_6 } =
          poll[0][0];
        const optionArray = [
          option_1,
          option_2,
          option_3,
          option_4,
          option_5,
          option_6,
        ];

        if (
          optionArray[pollOption - 1] == null ||
          pollOption > 6 ||
          pollOption < 0
        ) {
          return next("INVALID_POLL_OPTION");
        }
      }

      next();
    })
    .catch((err) => {
      return next(err);
    });
};

exports.checkUserAlreadyVoted = (req, res, next) => {
  conn
    .promise()
    .query(`SELECT * FROM Poll_responses WHERE poll = ? AND user = ?`, [
      req.pollId,
      req.user.id,
    ])
    .then((vote) => {
      if (vote[0].length != 0) {
        return next("ALREADY_VOTED");
      }

      next();
    })
    .catch((err) => {
      return next(err);
    });
};
