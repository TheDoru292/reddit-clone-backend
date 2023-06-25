const conn = require('../services/db');
const bcrypt = require('bcryptjs');
const {body, validationResult} = require('express-validator');
const jwt = require('jsonwebtoken');

exports.register = [
  body('username')
    .trim()
    .isLength({min: 3, max: 255})
    .escape()
    .withMessage('Username must be at least 3 characters long and max 255!'),
  body('password')
    .isString()
    .withMessage('Password must be a string!')
    .isLength({min: 8, max: 255})
    .escape()
    .withMessage('Password must be at least 8 characters long and max 255!'),
  body('email')
    .normalizeEmail({
      gmail_remove_dots: true,
      all_lowercase: true,
      gmail_remove_subaddress: true
    })
    .escape()
    .isEmail()
    .withMessage('Email must be a valid email address!'),
  
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.errArray = errors.array();
      return next('VALIDATION_ERR');
    }

    conn.promise().query(
      `INSERT INTO Users (
        username,
        password,
        email,
        registered_on,
        coins
      ) VALUES (
        ?,
        ?,
        ?,
        ?,
        0
      )`, [
        req.body.username,
        bcrypt.hashSync(req.body.password, 10),
        req.body.email,
        new Date().toJSON().slice(0, 19).replace('T', ' '),
      ]
    ).then(() => {
      return res.json({success: true, status: 'Account created'});
    }).catch((err) => {
      return next(err);
    });
  }
];

exports.login = [
  body('email')
    .normalizeEmail({
      gmail_remove_dots: true,
      all_lowercase: true,
      gmail_remove_subaddress: true
    })
    .isEmail()
    .withMessage('Email must be a valid email address!'),
  body('password')
    .isLength({min: 3, max: 255})
    .escape()
    .withMessage('Password must be at least 3 characters long and max 255!'),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.errArray = errors.array();
      return next('VALIDATION_ERR');
    }

    conn.promise().query(
      'SELECT * FROM Users WHERE email = ?', [req.body.email]
    ).then((user) => {
      if (user[0].length == 0) {
        return next('INCORRECT_CREDENTIALS');
      }
    
      bcrypt.compare(req.body.password, user[0][0].password, (err, success) => {
        if (err) {
          return next(err);
        }

        if (!success) {
          return next('INCORRECT_CREDENTIALS');
        }

        jwt.sign(
          {id: user[0].id, username: user[0][0].username},
          process.env.JWT_SECRET,
          (err, token) => {
            if (err) {
              return next(err);
            }

            return res.json({success: true, token});
          }
        );
      });
    }).catch((err) => {
      return next(err);
    });
  }
];
