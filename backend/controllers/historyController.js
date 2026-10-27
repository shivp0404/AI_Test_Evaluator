
const AssignmentHistory = require("../models/AssignmentHistory");

// Save an evaluated assignment
const saveHistory = async (req, res) => {
  try {
    const {
      fileName,
      mimeType,
      imageData,
      readable,
      summary,
      questions,
    } = req.body;

    if (!fileName || !imageData || !summary) {
      return res.status(400).json({
        success: false,
        message: "fileName, imageData, and summary are required",
      });
    }

    const history = await AssignmentHistory.create({
      fileName,
      mimeType,
      imageData,
      readable,
      summary,
      questions,
    });

    return res.status(201).json({
      success: true,
      message: "Assignment history saved",
      history,
    });
  } catch (error) {
    console.error("Save history error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to save assignment history",
    });
  }
};

// Retrieve assignment history (newest first)
const getHistory = async (req, res) => {
  try {
    const history = await AssignmentHistory.find()
      .select("-imageData")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    console.error("Get history error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve assignment history",
    });
  }
};

// Retrieve one assignment, including its original image
const getHistoryById = async (req, res) => {
  try {
    const history = await AssignmentHistory.findById(req.params.id);

    if (!history) {
      return res.status(404).json({
        success: false,
        message: "Assignment history not found",
      });
    }

    return res.status(200).json({
      success: true,
      history,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid history ID",
      });
    }

    console.error("Get history item error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve assignment",
    });
  }
};

module.exports = {
  saveHistory,
  getHistory,
  getHistoryById,
};
