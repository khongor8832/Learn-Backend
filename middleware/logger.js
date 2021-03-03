const logger = (req, res, next) => {
  console.log(
    `Logger middleware === Method нь: `.blue.inverse +
      ` ${req.method} `.yellow.inverse +
      "Дараах хаягаар: ".blue.inverse +
      ` ${req.protocol}://${req.host}${req.originalUrl}`.yellow
  );
  next();
};

module.exports = logger;
