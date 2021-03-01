const Category = require("../models/Category");
const MyError = require("../utils/MyError");
const asyncHandler = require("../middleware/asyncHandler");
const paginate = require("../utils/paginate");

exports.getCategories = asyncHandler(async (req, res, next) => {
  // Хайлтууд энд явагдаж байна.
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, Category);
  const categories12 = await Category.find(req.query, select)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);
  res.status(200).json({
    success: true,
    count: categories12.length,
    data: categories12,
    pagination,
  });
});
exports.getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id).populate(
    "category-тайХолбоотойНомууд"
  );
  // id хайгаад null байх юм бол шинээр алдаа цацаж байна.
  if (!category) {
    throw new MyError(
      req.params.id + " ID-тэй категори байхгүй. Controller categories.js",
      400
    );
  }
  res.status(200).json({
    success: true,
    data: category,
  });
});
exports.createCategory = asyncHandler(async (req, res, next) => {
  // console.log("data: ", req.body);
  const category14 = await Category.create(req.body);
  res.status(200).json({
    success: true,
    data: category14,
  });
});
exports.updateCategory = asyncHandler(async (req, res, next) => {
  const category15 = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // шинээр үүссэн юмыг авы гэж байна.
    runValidators: true, // model дээр бичсэн шалгалтуудыш бас шалгах
  });
  if (!category15) {
    throw new MyError(
      req.params.id + " ID-тэй категори байхгүй. Controller categories.js",
      400
    );
  }
  res.status(200).json({
    success: true,
    data: category15,
  });
});
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const category16 = await Category.findById(req.params.id);
  if (!category16) {
    throw new MyError(
      req.params.id + " ID-тэй категори байхгүй. Controller categories.js",
      400
    );
  }
  category16.remove();
  res.status(200).json({
    success: true,
    data: category16,
  });
});
