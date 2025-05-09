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

    // Gọi lại để populate đầy đủ
    const updated = await Question.findById(question._id)
      .populate("candidate", "fullName avatarUrl")
      .populate("answers.candidate", "fullName avatarUrl");

    res.status(201).json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add answer" });
  }
};
