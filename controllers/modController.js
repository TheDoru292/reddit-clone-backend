const mysql = require("mysql2/promise");
const config = require("../config");
const { body, validationResult } = require("express-validator");

exports.createPostFlair = [
  body("name")
    .trim()
    .escape()
    .isLength({ min: 3, max: 25 })
    .withMessage("Flair name should be at least 3 characters long and max 25!"),
  body("bgColor").custom((hex) => {
    const regex = /^#([0-9a-f]{3}){1,2}$/i;

    console.log(hex);
    console.log(regex.test(hex));

    if (!regex.test(hex)) {
      throw new Error("Background color hex code is invalid");
    } else {
      return true;
    }
  }),

  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.errArray = errors.array();
      return next("VALIDATION_ERR");
    }

    console.log(req.user);

    const conn = await mysql.createConnection(config.db);

    await conn.beginTransaction();

    try {
      const [flair] = await conn.execute(
        `INSERT INTO Subreddit_flairs (
            subreddit,
            name,
            bg_color
        ) VALUES (
            ?,
            ?,
            ?
        )`,
        [req.subreddit.id, req.body.name, req.body.bgColor]
      );

      await conn.execute(
        `INSERT INTO Subreddit_mod_log (
            subreddit,
            moderator,
            time,
            action,
            details
        ) VALUES (
            ?,
            ?,
            '${new Date().toJSON().slice(0, 19).replace("T", " ")}',
            'add_flair',
            ${null}
        )`,
        [req.subreddit.id, req.user.id]
      );

      await conn.commit();

      return res.json({ success: true, status: "Flair added" });
    } catch (err) {
      await conn.rollback();

      next(err);
    }
  },
];

exports.deletePostFlair = async (req, res, next) => {
  const conn = await mysql.createConnection(config.db);

  await conn.beginTransaction();

  try {
    await conn.execute(
      `DELETE FROM Subreddit_flairs WHERE name = ? AND subreddit = ?`,
      [req.params.flairName, req.subreddit.id]
    );

    await conn.execute(
      `INSERT INTO Subreddit_mod_log (
          subreddit,
          moderator,
          time,
          action
        ) VALUES (
          ?,
          ?,
          '${new Date().toJSON().slice(0, 19).replace("T", " ")}',
          'remove_flair'
        )`,
      [req.subreddit.id, req.user.id]
    );

    await conn.commit();

    return res.json({ success: true, status: "Flair deleted" });
  } catch (err) {
    await conn.rollback();

    next(err);
  }
};
