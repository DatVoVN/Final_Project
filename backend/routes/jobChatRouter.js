// 📁 routes/chatbot.js
const express = require("express");
const router = express.Router();
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const jobData = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../suggest/jobs_with_embeddings1.json"),
    "utf-8"
  )
);

const normalizeLanguage = (lang) => {
  const mapping = {
    react: ["react", "reactjs", "react.js"],
    "node.js": ["node", "node.js"],
    "c++": ["c++"],
    "c#": ["c#"],
  };
  lang = lang.toLowerCase();
  for (const [standard, variants] of Object.entries(mapping)) {
    if (variants.includes(lang)) return standard;
  }
  return lang;
};

const normalizeLocation = (loc) => {
  return loc
    .toLowerCase()
    .replace("tp ", "thành phố ")
    .replace("tp. ", "thành phố ");
};

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

async function extractFiltersFromQuestion(question) {
  const prompt = `Phân tích câu hỏi sau để trích xuất thông tin lọc job (lưu ý: đơn vị lương là TRIỆU VND/tháng và cần kèm toán tử so sánh):\n\n"${question}"\n\nTrả về kết quả dưới dạng JSON:\n{\n  "salaryMin": số | null,\n  "salaryMinOp": ">" | ">=" | null,\n  "salaryMax": số | null,\n  "salaryMaxOp": "<" | "<=" | null,\n  "location": string | null,\n  "remote": true | false | null,\n  "language": string | null,\n  "role": string | null\n}\nChỉ trả về JSON, không giải thích gì thêm.`;

  const res = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  try {
    const parsed = JSON.parse(res.data.choices[0].message.content);
    if (parsed.salaryMin && parsed.salaryMin > 500) {
      parsed.salaryMin = Math.round(parsed.salaryMin / 1_000_000);
    }
    if (parsed.salaryMax && parsed.salaryMax > 500) {
      parsed.salaryMax = Math.round(parsed.salaryMax / 1_000_000);
    }
    if (parsed.language) parsed.language = normalizeLanguage(parsed.language);
    if (parsed.location) parsed.location = normalizeLocation(parsed.location);
    return parsed;
  } catch (err) {
    console.error("Filter parse error:", err);
    return {};
  }
}

function filterJobs(jobData, filters) {
  return jobData.filter((job) => {
    if (job.salary == null) return false;

    let salaryOk = true;
    if (filters.salaryMin != null && filters.salaryMinOp) {
      if (filters.salaryMinOp === ">")
        salaryOk = job.salary > filters.salaryMin;
      else if (filters.salaryMinOp === ">=")
        salaryOk = job.salary >= filters.salaryMin;
    }
    if (salaryOk && filters.salaryMax != null && filters.salaryMaxOp) {
      if (filters.salaryMaxOp === "<")
        salaryOk = job.salary < filters.salaryMax;
      else if (filters.salaryMaxOp === "<=")
        salaryOk = job.salary <= filters.salaryMax;
    }

    const locationOk =
      !filters.location ||
      job.locationType?.toLowerCase().includes(filters.location) ||
      job.company?.city?.toLowerCase().includes(filters.location);
    const remoteOk = filters.remote === null || job.remote === filters.remote;
    const roleOk =
      !filters.role ||
      job.structuredInfo?.role
        ?.toLowerCase()
        .includes(filters.role.toLowerCase());
    const langOk =
      !filters.language ||
      (job.languages || []).some(
        (l) => normalizeLanguage(l) === filters.language
      );

    return salaryOk && locationOk && remoteOk && roleOk && langOk;
  });
}

function buildJobContextPrompt(jobs, question) {
  const CLIENT_URL =
    process.env.CLIENT_URL?.replace(/\/$/, "") || "http://localhost:3000";
  const contextText = jobs
    .map(
      (item) =>
        `- [${item.title}](${CLIENT_URL}/jobs/${item._id}) – ${
          item.salary || "Không rõ"
        } triệu – ${item.company?.city || "Không rõ"}`
    )
    .join("\n");

  return `Dưới đây là danh sách các job phù hợp với yêu cầu của người dùng:\n\n${contextText}\n\nHãy liệt kê lại chúng theo đúng định dạng, không thêm thông tin mô tả nào khác. Nếu không có job phù hợp, hãy nói rõ.`;
}

router.post("/chat", async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: "Missing question" });

  try {
    const filters = await extractFiltersFromQuestion(question);
    const filteredJobs = filterJobs(jobData, filters);
    const userEmbedding = await getEmbedding(question);

    const scoredJobs = filteredJobs
      .map((item) => ({
        ...item,
        score: cosine(userEmbedding, item.jobEmbedding),
      }))
      .sort((a, b) => b.score - a.score);

    if (scoredJobs.length === 0) {
      return res.json({
        answer: "Hiện tại không có job nào phù hợp với tiêu chí bạn đưa ra.",
        filters,
      });
    }

    const topJobs = scoredJobs.slice(0, 5);
    const prompt = buildJobContextPrompt(topJobs, question);
    const gptRes = await axios.post(
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

    const CLIENT_URL =
      process.env.CLIENT_URL?.replace(/\/$/, "") || "http://localhost:3000";
    res.json({
      answer: gptRes.data.choices[0].message.content,
      filters,
      matchedJobs: scoredJobs.map((j) => ({
        title: j.title,
        salary: j.salary,
        city: j.company?.city || "Không rõ",
        link: `${CLIENT_URL}/jobdetail/${j._id}`,
        score: j.score.toFixed(4),
        shortDesc: j.description?.slice(0, 150) + "...",
      })),
    });
  } catch (err) {
    console.error("Chat Error:", err);
    res.status(500).json({ error: "Server error", detail: err.message });
  }
});

module.exports = router;
