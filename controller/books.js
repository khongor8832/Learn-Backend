const path = require("path");
const Book = require("../models/Book");
const Category = require("../models/Category");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const User = require("../models/User");

// api/v1/books
exports.getBooks = asyncHandler(async (req, res, next) => {
  // Хайлтууд энд явагдаж байна.
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const sort = req.query.sort;
  const select = req.query.select;
  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);
  const pagination = await paginate(page, limit, Book);
  const books = await Book.find(req.query, select)
    .populate({
      path: "category",
      select: "name averagePrice",
    })
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);
  res.status(200).json({
    success: true,
    count: books.length,
    data: books,
    pagination,
  });
});
exports.getUserBooks = asyncHandler(async (req, res, next) => {
  req.query.createUser = req.userId;
  return this.getBooks(req, res, next);
});
// api/w1/categories/:catId/books
exports.getCategoryBooks = asyncHandler(async (req, res, next) => {
  // Хайлтууд энд явагдаж байна.
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, Book);
  const books = await Book.find(
    { ...req.query, category: req.params.categoryId },
    select
  )
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);
  res.status(200).json({
    success: true,
    count: books.length,
    data: books,
    pagination,
  });
});
exports.getBook = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    throw new MyError(req.params.id + "Id-тай ном байхгүй байна. ", 404);
  }
  const avg = await Book.computeCategoryAveragePrice(req.params.id);
  res.status(200).json({
    success: true,
    data: book,
    dundaj: avg,
  });
});
exports.createBook = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.body.category);
  if (!category) {
    throw new MyError(
      req.body.category + "Id-тай категори байхгүй байна. ",
      404
    );
  }
  req.body.createUser = req.userId;
  const book = await Book.create(req.body);
  res.status(200).json({
    success: true,
    data: book,
  });
});

exports.deleteBook = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    throw new MyError(req.params.id + "Id-тай ном байхгүй байна. ", 404);
  }
  const user = await User.findById(req.userId);
  book.remove();
  res.status(200).json({
    success: true,
    data: book,
    whoDeleted: user.name,
  });
});

exports.updateBook = asyncHandler(async (req, res, next) => {
  req.body.updateUser = req.userId;
  const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // шинээр үүссэн юмыг авы гэж байна.
    runValidators: true, // model дээр бичсэн шалгалтуудыш бас шалгах
  });
  if (!book) {
    throw new MyError(
      req.params.id + " ID-тэй ном байхгүй. Controller categories.js",
      400
    );
  }
  res.status(200).json({
    success: true,
    data: book,
  });
});
// PUT:  api/v1/books/:id/photo
exports.uploadBookPhoto = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүйээ.", 400);
  }
  // image upload хийхэд image эхэлсэн байна уу шалгаж байна.
  const file = req.files.file;
  if (!file.mimetype.startsWith("image")) {
    throw new MyError("Та зураг upload хийнэ үү: ", 400);
  }

  // image upload хийхэд хэмжээ 100000 бага байхаар шалгаж байна.
  if (file.size > process.env.MAX_UPLOAD_FILE_SIZE) {
    throw new MyError("Таны зурагны хэмжээ хэтэрсэн байна.", 400);
  }
  //файлын нэрийг өөрчлөж бүгд нэг стандарт нэртэй болно.
  file.name = `photo_${req.params.id}${path.parse(file.name).ext}`;

  //файлын зөөх өөрчлөх 2 argyment орж ирдэг эхнийнх хашаа зөөх гэж байгааг заана. дараагийнх callback функц яадаг вэ гэхээр зөөх явцад алдаа гарвал тэрийг хэлдэг байгаа эсвэл алдаа гараагүй бол хэлэх нь байна.
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, (err) => {
    if (err) {
      throw new MyError(
        "Файлыг хуулах явцад алдаа гарлаа. Алдаа : " + err.message,
        400
      );
    }
    // өгөгдлийн сангийн файлынхаа нэрийг өөрчилж байна.
    book.photo = file.name;
    book.save();
    res.status(200).json({
      success: true,
      data: file.name,
    });
  });

  // console.log(file.name);
});
