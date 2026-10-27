const express = require("express")
const cors = require("cors");
const app = express()

const assignmentRoutes = require("./routes/assignmentRoutes");
const historyRoutes = require("./routes/historyRoutes");

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json({ limit: "10mb" }))

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AI Assignment Evaluator API is running",
  });
});

app.use("/api/assignments", assignmentRoutes);
app.use("/api/history", historyRoutes);

module.exports = app