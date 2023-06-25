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
    case 'Not Found':
    case 'NOT_FOUND':
      return {
        statusCode: 404,
        status: 'Requested resource not found',
      };
    case 'VALIDATION_ERR':
      return {
        statusCode: 400,
        status: 'Check errors array!',
        errors: this.errArray
      };
    case 'INCORRECT_CREDENTIALS':
      return {
        statusCode: 401,
        status: 'Incorrect email or password',
      };
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
