const mongoose = require("mongoose");
const mongoURI = "mongodb://localhost:27017/ivykids";
const connect = async () => {
  await mongoose.connect(mongoURI).then(() => {
    console.log(`Connected to database`);
  });
};

module.exports = connect;
