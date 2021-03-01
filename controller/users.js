const User = require("../models/User");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");

// register
exports.register = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  const jwt = user.getJsonWebToken();
  res.status(200).json({
    success: true,
    jwt,
    user: user,
  });
});
