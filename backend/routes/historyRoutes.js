
const express = require("express");

const {
  saveHistory,
  getHistory,
  getHistoryById,
} = require("../controllers/historyController");

const router = express.Router();

router.post("/", saveHistory);
router.get("/", getHistory);
router.get("/:id", getHistoryById);

module.exports = router;
