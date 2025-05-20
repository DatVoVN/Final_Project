const multer = require("multer");
const pdfParse = require("pdf-parse");
const OpenAI = require("openai");

// Cấu hình OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Cấu hình multer lưu file trong RAM (buffer)
const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * Middleware upload 1 file field 'cv'
 */
exports.uploadCV = upload.single("cv");

/**
 * Controller xử lý upload và phân tích CV
 */
exports.analyzeCV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Vui lòng upload file PDF CV" });
    }

    // Chuyển PDF sang text
    const dataBuffer = req.file.buffer;
    const pdfData = await pdfParse(dataBuffer);
    const cvText = pdfData.text;

    // Tạo prompt cho OpenAI GPT-3.5
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

    // Gọi OpenAI GPT-3.5 Turbo
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

    // Cố gắng parse JSON từ kết quả trả về
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
