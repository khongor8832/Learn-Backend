const errorHandler = (err, req, res, next) => {
  console.log(
    "Middleware дотор error.js хэвлэж байна.".red.inverse +
      err.stack.cyan.underline
  ); //error-ын stack гэдэг обеъкт хэвлээд үзий
  const errorCopy = { ...err };
  errorCopy.message = err.message;
  if (errorCopy.name === "CastError") {
    errorCopy.message = "энэ ID буруу бүтэцтэй ID байна!";
    errorCopy.statusCode = 400;
  }
  if (
    errorCopy.name === "JsonWebTokenError" &&
    errorCopy.message === "invalid token"
  ) {
    errorCopy.message = "Буруу token байна!";
    errorCopy.statusCode = 400;
  }
  if (errorCopy.code === 11000) {
    errorCopy.errorMessage = "Энэ талбарын утгыг давхардуулж өгч болохгүй!";
    errorCopy.statusCode = 400;
  }
  res.status(err.statusCode || 500).json({
    success: false,
    middlewareError: errorCopy,
  });
};
module.exports = errorHandler;
