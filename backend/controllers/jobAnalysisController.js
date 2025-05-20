const OpenAI = require("openai");
const JobPosting = require("../models/JobPosting");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const extractJobInfo = async (job) => {
  const jobText = `
Tiêu đề: ${job.title}
Mô tả công việc:
${job.description}

Yêu cầu công việc:
${job.requirements}
`;

  const prompt = `
Bạn là một trợ lý AI chuyên trích xuất dữ liệu từ tin tuyển dụng IT. Hãy phân tích nội dung dưới đây và trả về dữ liệu dưới dạng JSON có cấu trúc như sau:

- summary: Mô tả ngắn gọn về công việc
- skills: Danh sách kỹ năng yêu cầu
- education: Yêu cầu học vấn (nếu có)
- experience: Yêu cầu kinh nghiệm
- certifications: Các chứng chỉ nếu có yêu cầu
- languages: Các ngôn ngữ lập trình, công nghệ, hoặc ngôn ngữ giao tiếp

Nếu không có thông tin, hãy để trống ("") hoặc mảng rỗng [].

JOB:
"""
${jobText}
"""

JSON kết quả:
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Bạn là một chuyên gia phân tích job tuyển dụng IT.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0,
      max_tokens: 700,
    });

    const gptResponse = completion.choices[0].message.content.trim();
    return JSON.parse(gptResponse);
  } catch (error) {
    console.error(`❌ GPT Error (jobId ${job._id}):`, error.message || error);
    return null;
  }
};

exports.extractAllJobsInfo = async (req, res) => {
  try {
    const jobs = await JobPosting.find();

    for (const job of jobs) {
      console.log(`🔍 Đang phân tích: ${job.title} (${job._id})`);
      const structuredInfo = await extractJobInfo(job);
      if (structuredInfo) {
        job.structuredInfo = structuredInfo;
        await job.save();
        console.log(`✅ Lưu structuredInfo cho job ${job._id}`);
      } else {
        console.warn(`⚠️ Bỏ qua job ${job._id}`);
      }
      await new Promise((r) => setTimeout(r, 1000)); // Nghỉ 1s
    }

    return res.json({ message: "✅ Phân tích và lưu toàn bộ job thành công" });
  } catch (err) {
    console.error("❌ Lỗi server khi phân tích jobs:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};
