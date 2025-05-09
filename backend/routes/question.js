const express = require("express");
const router = express.Router();
const questionController = require("../controllers/questionController");
const protectCandidate = require("../middleware/protectCandidate");

router.post("/", protectCandidate, questionController.createQuestion);
router.get("/", questionController.getAllQuestions);
router.get("/:id", questionController.getQuestionById);
router.post(
  "/:id/answers",
  protectCandidate,
  questionController.addAnswerToQuestion
);

module.exports = router;
