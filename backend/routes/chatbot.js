const express = require("express");
const router = express.Router();
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const faqData = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../chatbot/faq_with_embeddings.json"),
    "utf-8"
  )
);
const cosine = (a, b) => {
  const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
  const magB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
  return dot / (magA * magB || 1e-6);
};

async function getEmbedding(text) {
  try {
    const res = await axios.post(process.env.EMBEDDING_API_URL, { text });
    return res.data.embedding;
  } catch (err) {
    console.error("❌ Lỗi khi gọi embedding API:", {
      url: process.env.EMBEDDING_API_URL,
      text: text,
      status: err.response?.status,
      data: err.response?.data,
      message: err.message,
    });
    throw err;
  }
}
router.post("/chat", async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: "Missing question" });

  try {
    const userEmbedding = await getEmbedding(question);
    let bestAnswer = "Xin lỗi, tôi chưa hiểu câu hỏi của bạn.";
    let bestScore = -1;

    for (const item of faqData) {
      const score = cosine(userEmbedding, item.embedding);
      if (score > bestScore) {
        bestScore = score;
        bestAnswer = item.answer;
      }
    }

    res.json({ answer: bestAnswer, similarity: bestScore.toFixed(4) });
  } catch (err) {
    console.error(
      "❌ Lỗi khi xử lý /chat:",
      err.response?.data || err.message || err
    );
    res.status(500).json({
      error: "Chatbot error",
      detail: err.response?.data || err.message || "Unknown error",
    });
  }
});

module.exports = router;
