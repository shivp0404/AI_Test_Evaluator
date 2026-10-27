const AssignmentHistory = require("../models/AssignmentHistory")
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const evaluationSchema = {
  type: "object",
  properties: {
    readable: { type: "boolean" },
    message: { type: "string" },
    summary: {
      type: "object",
      properties: {
        totalScore: { type: "number" },
        maxScore: { type: "number" },
        overallFeedback: { type: "string" },
      },
      required: ["totalScore", "maxScore", "overallFeedback"],
    },
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          studentAnswer: { type: "string" },
          status: {
            type: "string",
            enum: [
              "correct",
              "partially_correct",
              "incorrect",
              "unclear",
            ],
          },
          score: { type: "number" },
          maxScore: { type: "number" },
          correctAnswer: { type: "string" },
          feedback: { type: "string" },
          markings: {
            type: "array",
            items: {
              type: "object",
              properties: {
                x: {
                  type: "number",
                  description:
                    "Horizontal position as a percentage of the full image width, from 0 to 100.",
                },
                y: {
                  type: "number",
                  description:
                    "Vertical position as a percentage of the full image height, from 0 to 100.",
                },
                symbol: {
                  type: "string",
                  enum: ["tick", "cross", "partial", "note"],
                },
                comment: {
                  type: "string",
                  description:
                    "Short teacher-style comment associated with this marking.",
                },
              },
              required: ["x", "y", "symbol", "comment"],
            },
          },
        },
        required: [
          "question",
          "studentAnswer",
          "status",
          "score",
          "maxScore",
          "correctAnswer",
          "feedback",
          "markings",
        ],
      },
    },
  },
  required: ["readable", "message", "summary", "questions"],
};

exports.evaluateAssignment = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Please upload an assignment image.",
    });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({
      success: false,
      message: "AI service is not configured.",
    });
  }

  try {
    const prompt = `
You are an assignment evaluator for common school and college subjects.

Analyze the supplied assignment image, which may contain printed or handwritten text.

Tasks:
1. Determine whether the image is readable and contains an assignment.
2. Extract each question and the student's answer.
3. Independently solve each question when no teacher-provided answer key is visible.
4. Compare the student's answer with the correct answer, allowing equivalent wording and valid alternative methods.
5. Classify each answer as correct, partially_correct, incorrect, or unclear.
6. Give constructive feedback for every question, including correct answers.
7. Provide a correct answer or expected solution when possible.
8. Do not invent unreadable questions or student answers. Use an empty string when text cannot be reliably extracted, and mark the answer unclear.
9. Use the marks printed on the assignment when available. If no marks are specified, use 1 point per question and state this assumption in overallFeedback.
10. Calculate totalScore and maxScore from the question scores.
11. For each question, return a markings array containing teacher-style annotations.
12. Each marking must include:
    - x: horizontal position as a percentage of the full image width, from 0 to 100.
    - y: vertical position as a percentage of the full image height, from 0 to 100.
    - symbol: "tick", "cross", "partial", or "note".
    - comment: a short teacher-style comment explaining the marking.
13. Position each marking near the corresponding answer on the image. Do not invent locations when the question or answer cannot be located reliably. Return an empty markings array when no reliable position can be identified.
14. Keep comments concise and consistent with the question's score and feedback.
15. Do not claim that marks have been physically drawn onto the image. Return annotation data only.

If the image is not a readable assignment, set readable to false, explain why in message, and return empty questions with both scores set to zero.

Return only data matching the required JSON schema.
`;

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: req.file.mimetype,
                data: req.file.buffer.toString("base64"),
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: evaluationSchema,
      },
    });

    if (!response.text) {
      throw new Error("The AI returned an empty response.");
    }

    const evaluation = JSON.parse(response.text);

    if (
      !evaluation ||
      typeof evaluation.readable !== "boolean" ||
      !evaluation.summary ||
      !Array.isArray(evaluation.questions)
    ) {
      throw new Error(
        "The AI response did not match the expected structure."
      );
    }

    // Validate and normalize annotations before returning them.
    evaluation.questions = evaluation.questions.map((question) => {
      const markings = Array.isArray(question.markings)
        ? question.markings
        : [];

      return {
        ...question,
        markings: markings.filter(
          (mark) =>
            Number.isFinite(mark.x) &&
            Number.isFinite(mark.y) &&
            mark.x >= 0 &&
            mark.x <= 100 &&
            mark.y >= 0 &&
            mark.y <= 100 &&
            ["tick", "cross", "partial", "note"].includes(mark.symbol) &&
            typeof mark.comment === "string"
        ),
      };
    });

 
const imageData = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

const savedHistory = await AssignmentHistory.create({
  fileName: req.file.originalname,
  mimeType: req.file.mimetype,
  imageData,
  readable: evaluation.readable,
  summary: evaluation.summary,
  questions: evaluation.questions,
});

return res.status(200).json({
  success: true,
  message: evaluation.message,
  file: {
    name: req.file.originalname,
    size: req.file.size,
    mimeType: req.file.mimetype,
  },
  evaluation,
  historyId: savedHistory._id,
});

  } catch (error) {
    console.error("Assignment evaluation failed:", error.message);

    return res.status(502).json({
      success: false,
      message: "Could not evaluate the assignment. Please try again.",
    });
  }
};
