const User = require("../models/User");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
// const { use } = require("../routes/users");
const sendEmail = require("../utils/email");
const crypto = require("crypto");

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
exports.forgetPassword = asyncHandler(async (req, res, next) => {
  if (!req.body.email) {
    throw new MyError("Та нууц үг сэргээх имэйл хаягаа дамжуулна уу", 400);
  }
  const user = await User.findOne({ email: req.body.email });
  // id хайгаад null байх юм бол шинээр алдаа цацаж байна.
  if (!user) {
    throw new MyError(req.body.id + " имэйлтэй  хэрэглэгч олдсонгүй.", 400);
  }
  const resetToken = user.generatePasswordChangeToken();
  await user.save();
  //Model шалгалтыг шалгахгүй хүчээр хадгалах бол ингэж хийж өгнө.
  // await user.save({ validateBeforeSave: false });

  //Имэйл илгээх
  const link = `https://amazon.mn/changepassword/${resetToken}`;
  const message = `Сайн байна уу <br><br> Та нууц үгээ солих хүсэлт илгээллээ. <br>Нууц үгээ доорх линк дээр дарж солино уу: <br><br><a target="_blanks" href="${link}">${link}</a><br><br> Өдрийг сайхан өнгөрүүлээрэй. `;
  const info = await sendEmail({
    email: user.email,
    subject: "Нууц үг өөрчлөх хүсэлт",
    message,
  });
  console.log("Message sent: %s", info.messageId);

  res.status(200).json({
    success: true,
    resetToken,
  });
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  if (!req.body.resetToken || !req.body.password) {
    throw new MyError("Та токен болон нууц үгээ дамжуулна уу", 400);
  }
  const encrypted = crypto
    .createHash("sha256")
    .update(req.body.resetToken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: encrypted,
    resetPasswordExpire: { $gt: Date.now() },
  });
  // id хайгаад null байх юм бол шинээр алдаа цацаж байна.
  if (!user) {
    throw new MyError("Токен хүчингүй байна.!", 400);
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  const token = user.getJsonWebToken();
  res.status(200).json({
    success: true,
    token,
    user: user,
  });
});
