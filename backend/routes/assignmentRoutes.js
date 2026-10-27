const express = require("express");
const multer = require("multer");
const {
  evaluateAssignment,
} = require("../controllers/assignmentController");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      return callback(
        new Error("Only image files are allowed.")
      );
    }

    callback(null, true);
  },
});

router.post(
  "/evaluate",
  upload.single("assignment"),
  evaluateAssignment
);

module.exports = router;