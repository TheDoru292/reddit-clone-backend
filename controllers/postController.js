const { body, validationResult } = require("express-validator");
const conn = require("../services/db");
const URL = require("url").URL;
const mysql = require("mysql2/promise");
const config = require("../config");
const async = require("async");
require("dotenv").config();

exports.createPost = [
  body("title")
    .trim()
    .escape()
    .isString()
    .withMessage("Title should be a string!")
    .isLength({ min: 3, max: 150 })
    .withMessage("Post title should be at least 3 characters and max 150!"),
  body("spoiler").isBoolean().withMessage("Spoiler value must be a boolean!"),
  body("oc").isBoolean().withMessage("OC value must be a boolean!"),
  body("nsfw").isBoolean().withMessage("NSFW value must be a boolean!"),
  body("type")
    .trim()
    .escape()
    .isString()
    .isLength({ min: 3 })
    .withMessage("Type must be a string!"),
  body("content").trim().escape().isString(),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.errArray = errors.array();
      return next("VALIDATION_ERR");
    }

    next();
  },

  // Verify post type
  (req, res, next) => {
    if (req.body.type == "post") {
      req.postType = "post";
      next();
    } else if (req.body.type == "media") {
      req.postType = "med";
      next();
    } else if (req.body.type == "url") {
      req.postType = "url";
      req.body.content = null;

      try {
        new URL(req.body.url);
        next();
      } catch (err) {
        next("INVALID_URL_PROVIDED");
      }
    } else if (req.body.type == "poll") {
      req.postType = "poll";

      const validDays = ["1d", "2d", "3d", "4d", "5d", "6d", "7d"];

      if (req.body.endsIn && validDays.includes(req.body.endsIn)) {
        if (
          typeof req.body.optionArray == "object" &&
          req.body.optionArray.length >= 2 &&
          req.body.optionArray.length <= 6
        ) {
          const numberOfDays = parseInt(req.body.endsIn);

          const currentTime = new Date().getTime();
          const updatedTime = new Date(
            currentTime + numberOfDays * 24 * 60 * 60 * 1000
          )
            .toJSON()
            .slice(0, 19)
            .replace("T", " ");

          req.endsIn = updatedTime;

          next();
        } else {
          next("INVALID_POLL");
        }
      } else {
        next("INVALID_POLL_DATE");
      }
    }
  },

  // Verify flair
  (req, res, next) => {
    if (req.body.flair) {
      conn
        .promise()
        .query(
          `SELECT * FROM subreddit_flairs WHERE subreddit = ? AND name = ?`,
          req.subreddit.id,
          req.body.flair
        )
        .then((flair) => {
          if (flair[0][0]) {
            req.flairId = flair[0][0].id;
            next();
          } else {
            return next("FLAIR_DOESNT_EXIST");
          }
        })
        .catch((err) => {
          return next(err);
        });
    } else {
      next();
    }
  },

  async (req, res, next) => {
    if (req.postType == "poll") {
      const conn = await mysql.createConnection(config.db);

      await conn.beginTransaction();

      try {
        const [post] = await conn.query(
          `INSERT INTO Posts (
            subreddit,
            user,
            posted_on,
            type,
            title,
            spoiler,
            nsfw,
            oc,
            content,
            flair,
            poll,
            link,
            deleted
          ) VALUES (
            ${req.subreddit.id},
            ${req.user.id},
            '${new Date().toJSON().slice(0, 19).replace("T", " ")}',
            '${req.postType}',
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            0
          )`,
          [
            req.body.title,
            req.body.spoiler,
            req.body.nsfw,
            req.body.oc,
            req.body.content || null,
            req.flairId || null,
            null,
            "poll",
            null,
          ]
        );

        const [poll] = await conn.execute(
          `INSERT INTO Polls (
            post,
            ends_in,
            option_1,
            option_2,
            option_3,
            option_4,
            option_5,
            option_6
          ) VALUES (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?
          )`,
          [
            post.insertId,
            req.endsIn,
            req.body.optionArray[0],
            req.body.optionArray[1],
            req.body.optionArray[2] || null,
            req.body.optionArray[3] || null,
            req.body.optionArray[4] || null,
            req.body.optionArray[5] || null,
          ]
        );

        await conn.execute(`UPDATE Posts SET poll = ? WHERE id = ?`, [
          poll.insertId,
          post.insertId,
        ]);

        await conn.commit();

        return res.json({ success: true, status: "Post created" });
      } catch (err) {
        conn.rollback();
        return next(err);
      }
    } else {
      conn
        .promise()
        .query(
          `INSERT INTO Posts (
            subreddit,
            user,
            posted_on,
            type,
            title,
            spoiler,
            nsfw,
            oc,
            content,
            flair,
            poll,
            link,
            deleted
          ) VALUES (
            ${req.subreddit.id},
            ${req.user.id},
            '${new Date().toJSON().slice(0, 19).replace("T", " ")}',
            '${req.postType}',
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            0
          )`,
          [
            req.body.title,
            req.body.spoiler,
            req.body.nsfw,
            req.body.oc,
            req.body.content || null,
            req.flairId || null,
            null,
            req.postType == "url" ? req.body.url : null,
            null,
          ]
        )
        .then(() => {
          return res.json({ success: true, status: "Post created" });
        })
        .catch((err) => {
          return next(err);
        });
    }
  },
];

exports.getPost = async (req, res, next) => {
  if (!req.subreddit.poll) {
    conn.promise().query().then().catch();
  } else {
    async.waterfall(
      [
        function (cb) {
          conn
            .promise()
            .query(`SELECT * FROM Posts WHERE id = ?`, [req.params.postId])
            .then((post) => {
              if (post[0].length == 0) {
                cb("NOT_FOUND");
              }

              console.log(post[0][0]);

              cb(null, post[0][0]);
            })
            .catch((err) => {
              cb(err);
            });
        },
        function (post, cb) {
          conn
            .promise()
            .query(`SELECT username FROM Users WHERE id = ?`, [post.user])
            .then((user) => {
              post.user = user[0][0].username;

              cb(null, post);
            })
            .catch((err) => {
              cb(err);
            });
        },
        function (post, cb) {
          conn
            .promise()
            .query(
              `SELECT COUNT(id) AS upvotes FROM Post_upvotes WHERE post = ?`,
              [post.id]
            )
            .then((result) => {
              post.upvotes = result[0][0].upvotes;

              cb(null, post);
            })
            .catch((err) => {
              cb(err);
            });
        },
        function (post, cb) {
          conn
            .promise()
            .query(
              `SELECT COUNT(id) AS downvotes FROM Post_downvotes WHERE post = ?`,
              [post.id]
            )
            .then((result) => {
              post.downvotes = result[0][0].downvotes;

              cb(null, post);
            })
            .catch((err) => {
              cb(err);
            });
        },
        function (post, cb) {
          conn
            .promise()
            .query(`SELECT id FROM Post_upvotes WHERE user = ? AND post = ?`, [
              req.user.id,
              post.id,
            ])
            .then((upvote) => {
              if (upvote[0].length == 0) {
                post.upvoted = false;
              } else {
                post.upvoted = true;
              }

              cb(null, post);
            })
            .catch((err) => {
              cb(err);
            });
        },
        function (post, cb) {
          if (!post.upvoted) {
            conn
              .promise()
              .query(`SELECT id Post_downvotes WHERE user = ? AND post = ?`, [
                req.user.id,
                post.id,
              ])
              .then((downvote) => {
                if (downvote[0].length == 0) {
                  post.downvoted = false;
                } else {
                  post.downvoted = true;
                }

                cb(null, post);
              })
              .catch((err) => cb(err));
          } else {
            cb(null, post);
          }
        },
      ],
      (err, post) => {
        if (err) {
          return next(err);
        }

        return res.json({ success: true, post });
      }
    );
  }
};

exports.deletePost = (req, res, next) => {
  conn
    .promise()
    .query(`UPDATE Posts SET deleted = 1 WHERE id = ?`, [req.params.postId])
    .then(() => {
      return res.json({ success: true, status: "Post deleted" });
    })
    .catch((err) => {
      return next(err);
    });
};
