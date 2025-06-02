const Question = require("../models/Question");

exports.createQuestion = async (req, res) => {
  try {
    const { content } = req.body;
    const candidateId = req.userId;

    if (!content) {
      return res.status(400).json({ error: "Missing question content" });
    }

    const question = await Question.create({ candidate: candidateId, content });
    res.status(201).json(question);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create question" });
  }
};

exports.getAllQuestions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Question.countDocuments();

    const questions = await Question.find()
      .populate("candidate", "fullName avatarUrl")
      .populate("answers.candidate", "fullName avatarUrl")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      page,
      totalPages: Math.ceil(total / limit),
      totalQuestions: total,
      questions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
};

exports.getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate("candidate", "fullName avatarUrl")
      .populate("answers.candidate", "fullName avatarUrl");

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    res.json(question);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch question" });
  }
};

exports.addAnswerToQuestion = async (req, res) => {
  try {
    const { content } = req.body;
    const candidateId = req.userId;

    if (!content) {
      return res.status(400).json({ error: "Missing answer content" });
    }

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    question.answers.push({ candidate: candidateId, content });
    await question.save();
    const updated = await Question.findById(question._id)
      .populate("candidate", "fullName avatarUrl")
      .populate("answers.candidate", "fullName avatarUrl");

    res.status(201).json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add answer" });
  }
};
exports.getMyQuestions = async (req, res) => {
  try {
    const candidateId = req.userId;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Question.countDocuments({ candidate: candidateId });

    const questions = await Question.find({ candidate: candidateId })
      .populate("candidate", "fullName avatarUrl")
      .populate("answers.candidate", "fullName avatarUrl")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      page,
      totalPages: Math.ceil(total / limit),
      totalQuestions: total,
      questions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch your questions" });
  }
};
exports.isMyQuestion = async (req, res) => {
  try {
    const candidateId = req.userId;
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }
    const isOwner =
      question.candidate._id.toString() === candidateId.toString();
    res.json({ isOwner });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to check question ownership" });
  }
};
exports.updateQuestion = async (req, res) => {
  try {
    const { content } = req.body;
    const candidateId = req.userId;

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    if (question.candidate._id.toString() !== candidateId.toString()) {
      return res
        .status(403)
        .json({ error: "Unauthorized to edit this question" });
    }

    question.content = content || question.content;
    await question.save();

    const updated = await Question.findById(req.params.id)
      .populate("candidate", "fullName avatarUrl")
      .populate("answers.candidate", "fullName avatarUrl");

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update question" });
  }
};
exports.deleteQuestion = async (req, res) => {
  try {
    const candidateId = req.userId;

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    if (question.candidate._id.toString() !== candidateId.toString()) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this question" });
    }

    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: "Question deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete question" });
  }
};
exports.isMyAnswer = async (req, res) => {
  try {
    const candidateId = req.userId;
    const { id: questionId, answerId } = req.params;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    const answer = question.answers.id(answerId);
    if (!answer) {
      return res.status(404).json({ error: "Answer not found" });
    }

    const isOwner = answer.candidate.toString() === candidateId.toString();
    res.json({ isOwner });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to check answer ownership" });
  }
};
exports.updateAnswer = async (req, res) => {
  try {
    const candidateId = req.userId;
    const { id: questionId, answerId } = req.params;
    const { content } = req.body;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    const answer = question.answers.id(answerId);
    if (!answer) {
      return res.status(404).json({ error: "Answer not found" });
    }

    if (answer.candidate.toString() !== candidateId.toString()) {
      return res
        .status(403)
        .json({ error: "Unauthorized to edit this answer" });
    }

    answer.content = content || answer.content;
    await question.save();

    const updated = await Question.findById(questionId)
      .populate("candidate", "fullName avatarUrl")
      .populate("answers.candidate", "fullName avatarUrl");

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update answer" });
  }
};
exports.deleteAnswer = async (req, res) => {
  try {
    const candidateId = req.userId;
    const { id: questionId, answerId } = req.params;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    const answer = question.answers.find((a) => a._id.toString() === answerId);
    if (!answer) {
      return res.status(404).json({ error: "Answer not found" });
    }

    if (answer.candidate.toString() !== candidateId.toString()) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this answer" });
    }
    question.answers = question.answers.filter(
      (a) => a._id.toString() !== answerId
    );
    await question.save();

    const updated = await Question.findById(questionId)
      .populate("candidate", "fullName avatarUrl")
      .populate("answers.candidate", "fullName avatarUrl");

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete answer" });
  }
};
