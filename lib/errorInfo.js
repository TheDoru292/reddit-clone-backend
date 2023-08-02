class ErrorInfo {
  err;
  errArray;

  constructor(err, errArray) {
    this.err = err.message || err;
    this.errArray = errArray;

    this.logError();
    console.log(err);
  }

  logError() {}

  get errorObj() {
    switch (this.err) {
      case "Not Found":
      case "NOT_FOUND":
        return {
          statusCode: 404,
          errorCode: this.err,
          status: "Requested resource not found",
        };
      case "VALIDATION_ERR":
        return {
          statusCode: 400,
          errorCode: this.err,
          status: "Check errors array!",
          errors: this.errArray,
        };
      case "INCORRECT_CREDENTIALS":
        return {
          statusCode: 401,
          errorCode: this.err,
          status: "Incorrect email or password",
        };
      case "SUBREDDIT_EXISTS":
        return {
          statusCode: 400,
          errorCode: this.err,
          status: "Subreddit already exists",
        };
      case "SUBREDDIT_TYPE_ERR":
        return {
          statusCode: 400,
          errorCode: this.err,
          status: "Invalid subreddit type",
        };
      case "INVALID_URL_PROVIDED":
        return {
          statusCode: 400,
          errorCode: this.err,
          status: "Invalid url provided",
        };
      case "INVALID_POLL":
        return {
          statusCode: 400,
          errorCode: this.err,
          status: "Provided poll structure is invalid",
        };
      case "INVALID_POLL_DATE":
        return {
          statusCode: 400,
          errorCode: this.err,
          status:
            "Provided date for poll is invalid. The minimum duration of a poll is 1d and the max is 7d",
        };
      case "NO_FLAIRS":
        return {
          statusCode: 400,
          errorCode: this.err,
          status: "Subreddit doesn't have flair(s)",
        };
      case "POST_ALREADY_UPVOTED":
        return {
          statusCode: 400,
          errorCode: this.err,
          status: "Post is already upvoted",
        };
      case "POST_ALREADY_DOWNVOTED":
        return {
          statusCode: 400,
          errorCode: this.err,
          status: "Post is already downvoted",
        };
      case "POST_NOT_UPVOTED":
        return {
          statusCode: 400,
          errorCode: this.err,
          status: "Post is not upvoted",
        };
      case "POST_NOT_DOWNVOTED":
        return {
          statusCode: 400,
          errorCode: this.err,
          status: "Post is not downvoted",
        };
      case "NOT_OP":
        return {
          statusCode: 400,
          errorCode: this.err,
          status: "You're not the original poster",
        };
      case "URL_TYPE":
        return {
          statusCode: 400,
          errorCode: this.err,
          status: "Url type posts can't be edited",
        };
      case "POLL_NOT_FOUND":
        return {
          statusCode: 404,
          errorCode: this.err,
          status: "Post doesn't have a poll",
        };
      case "POLL_ENDED":
        return {
          statusCode: 400,
          errorCode: this.err,
          status: "Poll has already ended",
        };
      case "INVALID_POLL_OPTION":
        return {
          statusCode: 400,
          errorCode: this.err,
          status: "You have selected an invalid poll option",
        };
      default:
        return {
          statusCode: 500,
          errorCode: "INTERNAL_ERR",
          status: "Internal Server Error",
        };
    }
  }
}

module.exports = ErrorInfo;
