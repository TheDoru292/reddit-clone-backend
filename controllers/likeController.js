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

exports.removePostUpvote = (req, res, next) => {
  if (req.postUpvoted) {
    conn
      .promise()
      .query(`DELETE FROM Post_upvotes WHERE user = ? AND post = ?`, [
        req.user.id,
        req.params.postId,
      ])
      .then(() => {
        return res.json({ success: true, status: "Removed post upvote" });
      })
      .catch((err) => {
        return next(err);
      });
  } else {
    return next("POST_NOT_UPVOTED");
  }
};

exports.downvotePost = async (req, res, next) => {
  if (req.postDownvoted) {
    return next("POST_ALREADY_DOWNVOTED");
  } else if (!req.postDownvoted && req.postUpvoted) {
    const conn = await mysql.createConnection(config.db);

    await conn.beginTransaction();

    try {
      await conn.execute(
        `DELETE FROM Post_upvotes WHERE user = ? AND post = ?`,
        [req.user.id, req.params.postId]
      );

      await conn.execute(
        `INSERT INTO Post_downvotes (user, post) VALUES (?, ?)`,
        [req.user.id, req.params.postId]
      );

      await conn.commit();
      return res.json({ success: true, status: "Post downvoted" });
    } catch (err) {
      await conn.rollback();
      return next(err);
    }
  } else {
    conn
      .promise()
      .query(`INSERT INTO Post_downvotes (post, user) VALUES (?, ?)`, [
        req.user.id,
        req.params.postId,
      ])
      .then((downvote) => {
        return res.json({ success: true, status: "Post downvoted" });
      })
      .catch((err) => {
        return next(err);
      });
  }
};

exports.removePostDownvote = (req, res, next) => {
  if (req.postDownvoted) {
    conn
      .promise()
      .query(`DELETE FROM Post_downvotes WHERE user = ? AND post = ?`, [
        req.user.id,
        req.params.postId,
      ])
      .then(() => {
        return res.json({ success: true, status: "Removed post downvote" });
      })
      .catch((err) => {
        return next(err);
      });
  } else {
    return next("POST_NOT_DOWNVOTED");
  }
};
