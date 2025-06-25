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
  const res = await axios.post(process.env.EMBEDDING_API_URL, { text });
  return res.data.embedding;
}
async function getAnswerWithGPT(context, question) {
  const prompt = `
Dưới đây là một số câu hỏi và câu trả lời từ hệ thống FAQ:

${context
  .map((item, i) => `Q${i + 1}: ${item.question}\nA${i + 1}: ${item.answer}`)
  .join("\n\n")}

Người dùng hỏi: "${question}"

Hãy sử dụng thông tin trên để trả lời một cách chính xác và đầy đủ nhất.
  `.trim();

  const res = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return res.data.choices[0].message.content;
}
router.post("/jobchat", async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: "Missing question" });

  try {
    const userEmbedding = await getEmbedding(question);
    const SIM_THRESHOLD = 0.3;
    const TOP_K = 3;
    const scoredFAQs = faqData
      .map((item) => ({
        ...item,
        score: cosine(userEmbedding, item.embedding),
      }))
      .filter((item) => item.score > SIM_THRESHOLD)
      .sort((a, b) => b.score - a.score)
      .slice(0, TOP_K);

    if (scoredFAQs.length === 0) {
      return res.json({
        answer: "Xin lỗi, tôi chưa có câu trả lời phù hợp cho câu hỏi này.",
        similarity: 0,
      });
    }

    const answer = await getAnswerWithGPT(scoredFAQs, question);

    res.json({
      answer,
      top_k_context: scoredFAQs.map(({ question, answer, score }) => ({
        question,
        answer,
        score: score.toFixed(4),
      })),
    });
  } catch (err) {
    console.error("RAG error:", err.response?.data || err.message);
    res.status(500).json({
      error: "RAG error",
      detail: err.response?.data || err.message,
    });
  }
});

module.exports = router;
