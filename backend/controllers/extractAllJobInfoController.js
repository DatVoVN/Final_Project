const OpenAI = require("openai");
const JobPosting = require("../models/JobPosting");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.extractStructuredInfoForAllJobs = async (req, res) => {
  try {
    const jobs = await JobPosting.find({ isActive: true });
    let updated = 0;

    for (const job of jobs) {
      const prompt = `
Trích xuất thông tin có cấu trúc từ mô tả công việc sau. Trả về đúng định dạng JSON sau (không giải thích gì khác ngoài JSON):

{
  "role": "", // Vai trò công việc phù hợp nhất, ví dụ: "Frontend Developer", "Backend Developer", "Data Analyst", "UI/UX Designer", "QA Engineer", v.v.
  "skills": [], // Danh sách kỹ năng kỹ thuật yêu cầu (viết ngắn gọn, ví dụ: JavaScript, Node.js, React)
  "education": "", // Yêu cầu về trình độ học vấn
  "experience": "" // Yêu cầu về kinh nghiệm làm việc
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

      job.structuredInfo = structured;
      await job.save();
      updated++;
    }

    return res.json({
      message: `Đã cập nhật structuredInfo cho ${updated} job.`,
    });
  } catch (err) {
    console.error("extractStructuredInfoForAllJobs Error:", err);
    return res.status(500).json({ error: "Lỗi server", detail: err.message });
  }
};
