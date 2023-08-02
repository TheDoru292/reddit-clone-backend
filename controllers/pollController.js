const conn = require("../services/db");

exports.votePoll = (req, res, next) => {
  conn
    .promise()
    .query(
      `
        INSERT INTO Poll_responses (
            user,
            poll,
            option_num
        ) VALUES (
            ?,
            ?,
            ?
        )
    `,
      [req.user.id, req.pollId, req.params.pollOption]
    )
    .then(() => {
      return res.json({ success: true, status: "Voted poll" });
    })
    .catch((err) => {
      return next(err);
    });
};
