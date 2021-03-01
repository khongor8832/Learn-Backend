const logger = (req, res, next) => {
  req.userId = "12312311212";
  console.log(
    `Logger middleware === Method нь: `.blue.inverse +
      ` ${req.method} `.yellow.inverse +
      "Дараах хаягаар: ".blue.inverse +
      ` ${req.protocol}://${req.host}${req.originalUrl}`.yellow
  );
  next();
};

module.exports = logger;
