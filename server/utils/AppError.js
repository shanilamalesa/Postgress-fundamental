// server/utils/AppError.js

//to define a custome error class for backend appplication
//common production pattern for express.js

//an app error that inherit from error, ->gets the message, stack, 
class AppError extends Error {
    //500->internal server error, has been used as a default
  constructor(message, statusCode = 500) {
    //without this message is not going to exist
    super(message);
    //
    this.statusCode = statusCode;
    //
    this.isOperational = true;
  }
}

module.exports = AppError;