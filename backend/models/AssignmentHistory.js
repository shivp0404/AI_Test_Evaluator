
const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      default: "",
    },
    studentAnswer: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["correct", "partially_correct", "incorrect", "unclear"],
      default: "unclear",
    },
    score: {
      type: Number,
      default: 0,
    },
    maxScore: {
      type: Number,
      default: 0,
    },
    correctAnswer: {
      type: String,
      default: "",
    },
    feedback: {
      type: String,
      default: "",
    },
    markings: [
      {
        x: Number,
        y: Number,
        symbol: {
          type: String,
          enum: ["tick", "cross", "partial", "note"],
        },
        comment: {
          type: String,
          default: "",
        },
      },
    ],
  },
  { _id: false }
);

const assignmentHistorySchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      default: "image/jpeg",
    },
    imageData: {
      type: String,
      required: true,
    },
    readable: {
      type: Boolean,
      default: true,
    },
    summary: {
      totalScore: {
        type: Number,
        default: 0,
      },
      maxScore: {
        type: Number,
        default: 0,
      },
      overallFeedback: {
        type: String,
        default: "",
      },
    },
    questions: {
      type: [questionSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "AssignmentHistory",
  assignmentHistorySchema
);
