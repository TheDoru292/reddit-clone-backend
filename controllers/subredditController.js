const {body, validationResult} = require('express-validator');
const mysql = require('mysql2/promise');
const async = require('async');
const config = require('../config');
const conn = require('../services/db');

exports.createSubreddit = [
  body('name')
    .trim()
    .escape()
    .isString()
    .withMessage('Subreddit name must be a string')
    .isLength({min: 3, max: 21})
    .withMessage('Subreddit name must be at least 3 characters long and max 21!'),
  body('type')
    .trim()
    .isString()
    .isLength({min: 3, max: 3})
    .withMessage('Subreddit type must be a string'),

  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.errArray = errors.array();
      return next('VALIDATION_ERR');
    }

    if (req.body.type == 'pub' ||
        req.body.type == 'res' ||
        req.body.type == 'pri'
    ) {
      const conn = await mysql.createConnection(config.db);

      await conn.beginTransaction();

      try {
        await conn.execute(
          `INSERT INTO Subreddit (
                name,
                type,
                owner,
                created_on
            ) VALUES (
                ?,
                ?,
                ?,
                ?
            )`, 
          [
            req.body.name,
            req.body.type,
            req.user.id,
            new Date().toJSON().slice(0, 19).replace('T', ' ')
          ]
        );

        const [subreddit] = await conn.execute(
          'SELECT * FROM Subreddit WHERE name = ?', [req.body.name]
        );

        await conn.execute(
          `INSERT INTO Moderators (
                subreddit,
                user
          ) VALUES (
                ?,
                ?
          )`, [subreddit[0].id, req.user.id]
        );

        await conn.commit();
        return res.json({success: true, status: 'Subreddit created'});

      } catch (err) {
        await conn.rollback();
        return next(err);
      }

    } else {
      return next('SUBREDDIT_TYPE_ERR');
    }
  },
];

exports.getSubreddit = (req, res, next) => {
  console.log(req.subreddit);
};
