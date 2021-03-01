// javascript-йн error-ыг өргөтгөж өөрийн гэсэн error үүсгэж байна.
class MyError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = MyError;
