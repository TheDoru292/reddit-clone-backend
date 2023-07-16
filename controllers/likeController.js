const mysql = require("mysql2/promise");
const conn = require("../services/db");
const config = require("../config");
require("dotenv").config();

exports.upvotePost = async (req, res, next) => {
  if (req.postUpvoted) {
    return next("POST_ALREADY_UPVOTED");
  } else if (!req.postUpvoted && req.postDownvoted) {
    const conn = await mysql.createConnection(config.db);

    await conn.beginTransaction();

    try {
      await conn.execute(
        `DELETE FROM Post_downvotes WHERE user = ? AND post = ?`,
        [req.user.id, req.params.postId]
      );

      await conn.execute(
        `INSERT INTO Post_upvotes (user, post) VALUES (?, ?)`,
        [req.user.id, req.params.postId]
      );

      await conn.commit();
      return res.json({ success: true, status: "Post liked" });
    } catch (err) {
      await conn.rollback();

      return next(err);
    }
  } else {
    conn
      .promise()
      .query(`INSERT INTO Post_upvotes (user, post) VALUES (?, ?)`, [
        req.user.id,
        req.params.postId,
      ])
      .then((like) => {
        return res.json({ success: true, status: "Post liked" });
      })
      .catch((err) => {
        return next(err);
      });
  }
};
