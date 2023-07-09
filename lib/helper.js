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
