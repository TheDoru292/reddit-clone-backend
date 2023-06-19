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
    switch(this.err) {
    default:
      return {
        statusCode: 500,
        errorCode: null,
        status: 'Internal Server Error'
      };
    }
  }
}

module.exports = ErrorInfo;
