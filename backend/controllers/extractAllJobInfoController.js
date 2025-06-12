const OpenAI = require("openai");
const fs = require("fs");
const JobPosting = require("../models/JobPosting");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.extractAndEmbedJobs = async (req, res) => {
  try {
    const jobs = await JobPosting.find({ isActive: true });
    let updated = 0;
    const processedJobs = [];

    for (const job of jobs) {
      const prompt = `
Trích xuất thông tin có cấu trúc từ mô tả công việc sau. Trả về đúng định dạng JSON sau (chỉ trả về JSON, không giải thích gì cả):
{
  "role": "", // Ví dụ: "Frontend Developer", "Backend Developer", "Data Analyst", v.v.
  "skills": [] // Danh sách kỹ năng kỹ thuật (JavaScript, Node.js, React, ...)
}

Thông tin công việc:
Tiêu đề: ${job.title}
Mô tả: ${job.description}
Yêu cầu: ${job.requirements}
`.trim();

      const { choices } = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        temperature: 0,
        messages: [{ role: "user", content: prompt }],
      });

      const structured = JSON.parse(choices[0].message.content);

      const inputText = `Role: ${
        structured.role
      }. Skills: ${structured.skills.join(", ")}`;

      const { data } = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: inputText,
      });

      const embedding = data[0].embedding;

      job.structuredInfo = structured;
      job.jobEmbedding = embedding;
      await job.save();

      updated++;
      processedJobs.push({
        ...job.toObject(),
        structuredInfo: structured,
        jobEmbedding: embedding,
      });
    }

    fs.writeFileSync(
      "./suggest/jobs_with_embeddings.json",
      JSON.stringify(processedJobs, null, 2),
      "utf-8"
    );

    return res.json({
      message: `Đã cập nhật ${updated} job với role + skills.`,
    });
  } catch (err) {
    console.error("extractAndEmbedJobs Error:", err);
    return res.status(500).json({ error: "Lỗi server", detail: err.message });
  }
};
