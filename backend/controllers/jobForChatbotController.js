const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");
const JobPosting = require("../models/JobPosting");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.extractAndEmbedJobs1 = async (req, res) => {
  try {
    const jobs = await JobPosting.find({ isActive: true }).populate("company");
    let updated = 0;
    const processedJobs = [];

    for (const job of jobs) {
      const extractionPrompt = `
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
        messages: [{ role: "user", content: extractionPrompt }],
      });

      const structured = JSON.parse(choices[0].message.content);

      const inputText = `
Title: ${job.title}
Role: ${structured.role}
Skills: ${structured.skills.join(", ")}
Salary: ${job.salary || "Unknown"} triệu VND/tháng
Job Type: ${job.jobType}
Experience Level: ${job.experienceLevel}
Location Type: ${job.locationType}
City: ${job.company?.city || "Không rõ"}
Remote: ${job.remote ? "Yes" : "No"}
Languages: ${(job.languages || []).join(", ")}
Vacancies: ${job.vacancies}
Deadline: ${job.deadline}
Benefits: ${(job.benefits || []).join(" | ")}
Description: ${job.description}
Requirements: ${job.requirements}
      `.trim();

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

    const outputPath = path.join(
      __dirname,
      "../suggest/jobs_with_embeddings1.json"
    );
    fs.writeFileSync(
      outputPath,
      JSON.stringify(processedJobs, null, 2),
      "utf-8"
    );

    return res.json({
      message: `Đã cập nhật ${updated} job với thông tin và embedding.`,
    });
  } catch (err) {
    console.error("extractAndEmbedJobs Error:", err);
    return res.status(500).json({ error: "Lỗi server", detail: err.message });
  }
};
