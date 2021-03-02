const User = require("../models/User");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const { use } = require("../routes/users");

// register
exports.register = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  const token = user.getJsonWebToken();
  res.status(200).json({
    success: true,
    token,
    user: user,
  });
});

// login хийнэ.
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  // Оролтыг шалгана.
  if (!email || !password) {
    throw new MyError("Имэйл болон нууц үгээ дамжуулна уу", 400);
  }
  //Тухайн хэрэглэгчийг хайна.
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new MyError("Имэйл болон нууц үгээ зөв оруулна уу", 401);
  }
  // Нууц үг шалгана.
  const ok = await user.checkPassword(password);
  if (!ok) {
    throw new MyError("Имэйл болон нууц үгээ зөв оруулна уу", 401);
  }
  const token = user.getJsonWebToken();

  res.status(200).json({
    success: true,
    token,
    user: user,
  });
});

exports.getUsers = asyncHandler(async (req, res, next) => {
  // Хайлтууд энд явагдаж байна.
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, User);
  const users = await User.find(req.query, select)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);
  res.status(200).json({
    success: true,
    data: users,
    pagination,
  });
});
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  // id хайгаад null байх юм бол шинээр алдаа цацаж байна.
  if (!user) {
    throw new MyError(req.params.id + " ID-тэй  хэрэглэгч байхгүй.", 400);
  }
  res.status(200).json({
    success: true,
    data: user,
  });
});
exports.createUser = asyncHandler(async (req, res, next) => {
  // console.log("data: ", req.body);
  const user = await User.create(req.body);
  res.status(200).json({
    success: true,
    data: user,
  });
});
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // шинээр үүссэн юмыг авы гэж байна.
    runValidators: true, // model дээр бичсэн шалгалтуудыш бас шалгах
  });
  if (!user) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүй. ", 400);
  }
  res.status(200).json({
    success: true,
    data: user,
  });
});
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new MyError(
      req.params.id + " ID-тэй категори байхгүй. Controller categories.js",
      400
    );
  }
  user.remove();
  res.status(200).json({
    success: true,
    data: user,
  });
});
