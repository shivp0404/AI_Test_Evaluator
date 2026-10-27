require("dotenv").config();
const app = require('./app')
const connectDb = require("./config/db");

const PORT = process.env.PORT || 5000;
const db_line = process.env.DBLINK || "mongodb://127.0.0.1:27017/gradewise"

const startServer = async () => {
  try {
    await connectDb();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();