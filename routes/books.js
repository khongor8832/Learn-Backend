const express = require("express");
const { protect } = require("../middleware/protect");

const {
  getBooks,
  getBook,
  createBook,
  deleteBook,
  updateBook,
  uploadBookPhoto,
} = require("../controller/books");

const router = express.Router({ mergeParams: true });

//"/api/w1/books"
router.route("/").get(getBooks).post(protect, createBook);
router
  .route("/:id")
  .get(getBook)
  .delete(protect, deleteBook)
  .put(protect, updateBook);
router.route("/:id/photo").put(uploadBookPhoto);

module.exports = router;
