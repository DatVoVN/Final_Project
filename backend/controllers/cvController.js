const multer = require("multer");
const pdfParse = require("pdf-parse");
const OpenAI = require("openai");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });
exports.uploadCV = upload.single("cv");
exports.analyzeCV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Vui lòng upload file PDF CV" });
    }
    const dataBuffer = req.file.buffer;
    const pdfData = await pdfParse(dataBuffer);
    const cvText = pdfData.text;
    const prompt = `
Bạn là một trợ lý AI phân tích CV tiếng Việt/Anh. Hãy đọc nội dung CV dưới đây và trích xuất thông tin thành JSON với các trường:
- summary: Tóm tắt ngắn gọn về ứng viên
- skills: Danh sách kỹ năng chính
- education: Thông tin học vấn (trường, ngành, bằng cấp)
- experience: Kinh nghiệm làm việc chính (vị trí, công ty, thời gian, mô tả)
- certifications: Các chứng chỉ có liên quan
- languages: Các ngôn ngữ nói được và trình độ

Nếu không có thông tin nào thì để trống hoặc mảng rỗng.

CV:
\"\"\"${cvText}\"\"\"

JSON:
`;
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Bạn là một trợ lý phân tích CV chuyên nghiệp.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0,
      max_tokens: 1000,
    });

    const responseText = completion.choices[0].message.content;
    let data = null;
    try {
      data = JSON.parse(responseText);
    } catch (err) {
      return res.status(500).json({
        error: "Không parse được JSON từ kết quả OpenAI",
        rawResponse: responseText,
      });
    }

    return res.json({ extractedData: data });
  } catch (error) {
    console.error("Analyze CV error:", error);
    return res.status(500).json({ error: "Lỗi server khi phân tích CV" });
  }
};
