const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");
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

router
  .route("/")
  .get(getCategories)
  .post(protect, authorize("admin"), createCategory);
router
  .route("/:id")
  .get(getCategory)
  .put(protect, authorize("admin", "operator"), updateCategory)
  .delete(protect, authorize("admin"), deleteCategory);
//router холбохдоо route функцын дуудаад замын тавьж ямар мэссэж болон юу дуудахыг шууд бичээд өгдөг.
module.exports = router;
