const mongoose = require("mongoose");
const { transliterate, slugify } = require("transliteration");

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Категорийн нэрийг оруулна уу"],
      unique: true, // Давхардаж орж болохгүй
      trim: true, // урд хойн орсон зай гэх мэт-йиг автоматаар цэвэрлээд өгөөрэй
      maxlength: [
        30,
        "Категорийн нэрний урт дээд тал нь 30 тэмдэгт байх ёстой.",
      ],
    },
    slug: String,
    description: {
      type: String,
      required: [true, "Категорийн тайлбарыг заавал оруулна уу"],
      maxlength: [
        500,
        "Категорийн тайлбарын урт дээд тал нь 500 тэмдэгт байх ёстой.",
      ],
    },
    photo: {
      type: String,
      default: "no-photo.jpg",
    },
    averageRating: {
      type: Number,
      min: [1, "Рэйнтинг хамгийн багадаа 1 байх ёстой "],
      max: [10, "Рэйнтинг хамгийн багадаа 10 байх ёстой "],
    },
    averagePrice: Number,
    createdAd: {
      type: Date,
      default: Date.now,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } } // mongoose virtuals нэмж өгч байна.
);
CategorySchema.virtual("category-тайХолбоотойНомууд", {
  ref: "Book", // энэд бол book гэсэн model-той холбогдоно.
  localField: "_id", // манай category  model-ын аль талбарыг ашиглаж холбогдох
  foreignField: "category", //book гэсэн model-ын юутай холбогдох
  justOne: false, // ганц өгөгдөл авахгүй олон байвал олныг авна.
});
CategorySchema.pre("remove", async function (next) {
  console.log("remove .......");

  await this.model("Book").deleteMany({
    category: this._id,
  });
  next();
});
CategorySchema.pre("save", function (next) {
  this.slug = slugify(this.name);
  this.averageRating = Math.floor(Math.random() * 10) + 1;
  // this.averagePrice = Math.floor(Math.random() * 100000) + 3000;
  next();
});
module.exports = mongoose.model("Category", CategorySchema);
