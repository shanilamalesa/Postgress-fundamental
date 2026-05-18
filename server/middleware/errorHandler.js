// server/middleware/errorHandler.js

//is a centralised globalware middleware 
//importin app err-that allows the middle ware to dictate
const AppError = require("../utils/AppError");

// eslint-disable-next-line no-unused-vars
//helps us to give us a one error format
module.exports = function errorHandler(err, req, res, next) {
    //catches the intentional app error-> that gives api a clean response
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { message: err.message },
    });
  }

  // Postgres unique violation
  //postgress error code
  if (err.code === "23505") {
    return res.status(409).json({//409->conflic request
        //this improve the user expirience
      error: { message: "That record already exists." },
    });
  }

  // Postgres check constraint violation
  //
  if (err.code === "23514") {
    return res.status(400).json({//400->bad request
      error: { message: "Invalid value for a constrained column." },
    });
  }
//any unexpected error for debugging
  console.error("Unhandled error:", err);
  res.status(500).json({ error: { message: "Internal server error" } });
};