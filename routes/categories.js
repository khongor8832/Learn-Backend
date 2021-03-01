const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/protect");
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controller/categories.js");
const { getCategoryBooks } = require("../controller/books");

// /api/v1/categories/:id/books
router.route("/:categoryId/books").get(getCategoryBooks);

router.route("/").get(getCategories).post(protect, createCategory);
router
  .route("/:id")
  .get(getCategory)
  .put(protect, updateCategory)
  .delete(protect, deleteCategory);
//router холбохдоо route функцын дуудаад замын тавьж ямар мэссэж болон юу дуудахыг шууд бичээд өгдөг.
module.exports = router;
