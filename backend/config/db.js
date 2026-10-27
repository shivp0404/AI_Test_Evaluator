
const mongoose = require("mongoose");

const connectDb = async (dblink) => {
  try {
    await mongoose.connect(dblink);

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDb;
