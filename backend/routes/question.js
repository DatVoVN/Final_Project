const express = require("express");
const router = express.Router();
const questionController = require("../controllers/questionController");
const protectCandidate = require("../middleware/protectCandidate");

// Tạo câu hỏi
router.post("/", protectCandidate, questionController.createQuestion);

// Lấy tất cả câu hỏi
router.get("/", questionController.getAllQuestions);

// Lấy tất cả câu hỏi mình đã đăng
router.get("/mine", protectCandidate, questionController.getMyQuestions);

// Kiểm tra xem có phải câu hỏi mình đăng không
router.get("/:id/is-mine", protectCandidate, questionController.isMyQuestion);

// Lấy chi tiết 1 câu hỏi
router.get("/:id", questionController.getQuestionById);

// Trả lời câu hỏi
router.post(
  "/:id/answers",
  protectCandidate,
  questionController.addAnswerToQuestion
);

// Chỉnh sửa câu hỏi
router.put("/:id", protectCandidate, questionController.updateQuestion);

// Xóa câu hỏi
router.delete("/:id", protectCandidate, questionController.deleteQuestion);
router.get(
  "/:id/answers/:answerId/is-mine",
  protectCandidate,
  questionController.isMyAnswer
);
router.put(
  "/:id/answers/:answerId",
  protectCandidate,
  questionController.updateAnswer
);
router.delete(
  "/:id/answers/:answerId",
  protectCandidate,
  questionController.deleteAnswer
);
module.exports = router;
