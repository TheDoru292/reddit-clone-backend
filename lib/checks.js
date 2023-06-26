const conn = require('../services/db');

exports.checkSubredditAvailability = (req, res, next) => {  
  conn.promise().query(
    'SELECT * FROM Subreddit WHERE name = ?', [req.body.name],
  ).then((subreddit) => {
    if (subreddit[0].length != 0) {
      return next('SUBREDDIT_EXISTS');
    } else {
      next();
    }
  }).catch((err) => {
    return next(err);
  });
};
