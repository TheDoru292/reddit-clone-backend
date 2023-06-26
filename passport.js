const conn = require('./services/db');
const passport = require('passport');
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
require('dotenv').config();

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    (jwtPayload, cb) => {
      return conn.query(
        'SELECT * FROM Users WHERE username = ?', [jwtPayload.username],
        (err, results) => {
          if (err) {
            cb(err);
          }

          if (results) {
            cb(null, results[0]);
          }
        },
      );
    },
  )
);
