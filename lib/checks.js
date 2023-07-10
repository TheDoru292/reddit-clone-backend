const conn = require("../services/db");

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
  } else if (req.subreddit.type == "res") {
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
