// Nodejs core library-нууд express бусад нь
const express = require("express");
const detonv = require("dotenv");
const path = require("path"); // Файлын системийн замтай ажиллах library
// npm library-нууд
const morgan = require("morgan"); // console болон файлын руу log бичдэг.
const rfs = require("rotating-file-stream"); // Тусад нь log гэсэн folder үүсгэж энэ library-г ашиглаж байна.
const colors = require("colors"); // console дээр гарч байгааг өнгөтөөр харуулж хийж болдог.
const fileUpload = require("express-fileupload"); // Зураг оруулж ирэх
// өөрийн үүсгэж өгсөн folder-ээс оруулж ирж байна.
const connectDB = require("./config/db"); // MongoDB database-тэй холбогдох
const logger = require("./middleware/logger");
const categorieRouter = require("./routes/categories");
const booksRouter = require("./routes/books");
const usersRouter = require("./routes/users");
const errorHandler = require("./middleware/error");
const injectDb = require("./middleware/injectDb");

detonv.config({ path: "./config/config.env" });
//SQL холбогдох
const db = require("./config/db_mysql");

// оруулж ирсэнээ энд дуудаж ажиллуулж байна.
const app = express();
connectDB(); //database-тэй холбогдох

var accessLogStream = rfs.createStream("access.log", {
  interval: "1d", // rotate daily
  path: path.join(__dirname, "log"),
});
console.log(
  "Fs ашиглаж одоо байгаа folder-ыг зааж байна. ".blue.inverse +
    __dirname.yellow.inverse
);
// body parser
app.use(express.json()); // req орж ирсэн message болгоны body хэсгийг шалгаад хэрвээ json өгөгдөл байх юм бол req.body гэдэг хувьсагчинд хийгээд өгөөрэй гэж байна.
//middleware
app.use(fileUpload()); // Зураг оруулж ирэх
app.use(logger);
app.use(injectDb(db));
app.use(morgan("combined", { stream: accessLogStream }));
app.use("/api/w1/categories", categorieRouter);
app.use("/api/w1/books", booksRouter);
app.use("/api/w1/users", usersRouter);
app.use(errorHandler);

db.sequelize
  .sync()
  .then((result) => {
    console.log("sync хийгдлээ");
  })
  .catch((err) => console.log(err + "////////////888888888888888"));

const server = app.listen(
  process.env.PORT,
  console.log(`Express server ${process.env.PORT} порт нь дээр ажиллаа`.rainbow)
);

process.on("unhandledRejection", (err, promise) => {
  console.log(`Систэмд алдаа гарлаа ${err.message}`.red.inverse);
  server.close(() => {
    // server-ын close функцыг дуудаж байна.
    process.exit(1); // server-ээ зогсоож байна.
  });
}); //on гэдэг event болвол гэнэ. барагдагүй байгаа алдаануудыг энд барьж
