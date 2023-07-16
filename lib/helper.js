const conn = require("../services/db");

exports.checkSubredditExistsAndGetId = (req, res, next) => {
  conn
    .promise()
    .query(
      `SELECT id, name, title, description, type, created_on, owner FROM Subreddit
     WHERE name = ?`,
      [req.params.redditName]
    )
    .then((subreddit) => {
      if (subreddit[0].length == 0) {
        return next("NOT_FOUND");
      }

      req.subreddit = subreddit[0][0];

      next();
    })
    .catch((err) => {
      return next(err);
    });
};

exports.checkPostExistsAndGetSubreddit = (req, res, next) => {
  conn
    .promise()
    .query(
      `
        SELECT p.*, sr.* FROM Posts AS p
        INNER JOIN Subreddit AS sr ON p.subreddit = sr.id
        WHERE p.id = ?
      `,
      [req.params.postId]
    )
    .then((result) => {
      if (result[0].length == 0) {
        return next("NOT_FOUND");
      }

      req.subreddit = result[0][0];

      next();
    })
    .catch((err) => {
      return next(err);
    });
};
