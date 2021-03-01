const mongoose = require("mongoose");

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true, //URL Parse хийх төхөөрөмжөөр өөрчилсөн байдаг. Шинийг ашиглана. .
    useCreateIndex: true, //Шинэ хулбарын ашиглан
    useFindAndModify: false,
    useUnifiedTopology: true,
  });
  console.log(`MongoDB холбогдлоо: ${conn.connection.host}`.green.inverse);
};

module.exports = connectDB;
