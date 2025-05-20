const OpenAI = require("openai");
const JobPosting = require("../models/JobPosting");
const { cosineSimilarity } = require("../utils/cosine");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function getEmbedding(text) {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return res.data[0].embedding;
}

// Chuyển CV structured JSON thành 1 đoạn text để embed
function buildCVText(cv) {
  const educationText =
    typeof cv.education === "object"
      ? `Trường: ${cv.education.university || ""}, Ngành: ${
          cv.education.major || ""
        }, Bằng cấp: ${cv.education.degree || ""}`
      : "";

  const experienceText = Array.isArray(cv.experience)
    ? cv.experience
        .map((exp) => {
          return `- Vị trí: ${exp.position || ""}, Công ty: ${
            exp.company || ""
          }, Thời gian: ${exp.timeframe || ""}, Mô tả: ${
            exp.description || ""
          }`;
        })
        .join("\n")
    : "";

  const skillsText = Array.isArray(cv.skills) ? cv.skills.join(", ") : "";
  const languagesText = Array.isArray(cv.languages)
    ? cv.languages.join(", ")
    : "";

  const text = `
🧑‍💻 CV TEXT:
Tóm tắt: ${cv.summary || ""}
Kỹ năng: ${skillsText}
Học vấn: ${educationText}
Kinh nghiệm:
${experienceText}
Ngôn ngữ: ${languagesText}
`;

  console.log(text);
  return text;
}

// Chuyển job structuredInfo thành text để embed
function buildJobText(job) {
  const info = job.structuredInfo || {};

  const educationText = Array.isArray(info.education)
    ? info.education.join(", ")
    : typeof info.education === "object"
    ? `Trường: ${info.education.university || ""}, Ngành: ${
        info.education.major || ""
      }, Bằng cấp: ${info.education.degree || ""}`
    : info.education || "";

  const experienceText = Array.isArray(info.experience)
    ? info.experience
        .map((exp) => {
          if (typeof exp === "string") return exp;
          return `Vị trí: ${exp.position || ""}, Công ty: ${
            exp.company || ""
          }, Thời gian: ${exp.timeframe || ""}, Mô tả: ${
            exp.description || ""
          }`;
        })
        .join(" | ")
    : typeof info.experience === "string"
    ? info.experience
    : "";

  const skillsText = Array.isArray(info.skills) ? info.skills.join(", ") : "";
  const languagesText = Array.isArray(info.languages)
    ? info.languages.join(", ")
    : "";

  const text = `
🏢 JOB TEXT:
Tiêu đề: ${job.title || ""}
Tóm tắt: ${info.summary || ""}
Kỹ năng: ${skillsText}
Học vấn: ${educationText}
Kinh nghiệm: ${experienceText}
Ngôn ngữ: ${languagesText}
`;

  console.log(text);
  return text;
}

exports.matchCVToAllJobs = async (req, res) => {
  try {
    const { cvData } = req.body;

    if (!cvData) {
      return res.status(400).json({ error: "Thiếu dữ liệu CV" });
    }

    const jobs = await JobPosting.find({
      structuredInfo: { $exists: true },
    }).lean();

    if (!jobs.length) {
      return res
        .status(404)
        .json({ error: "Không có job nào đã được phân tích" });
    }

    const cvText = buildCVText(cvData);
    const cvVector = await getEmbedding(cvText);

    const matches = [];

    for (const job of jobs) {
      const jobText = buildJobText(job);
      const jobVector = await getEmbedding(jobText);

      const score = cosineSimilarity(cvVector, jobVector);
      const percentage = Math.round(score * 100);

      let level = "Không phù hợp";
      if (score > 0.85) level = "Rất phù hợp";
      else if (score > 0.7) level = "Phù hợp";
      else if (score > 0.5) level = "Khá phù hợp";

      matches.push({
        jobId: job._id,
        title: job.title,
        company: job.company?.name || "Không rõ",
        score: percentage,
        level,
      });

      await new Promise((r) => setTimeout(r, 300));
    }

    // Sắp xếp kết quả theo điểm cao nhất
    matches.sort((a, b) => b.score - a.score);

    return res.json({ matches });
  } catch (err) {
    console.error("Lỗi khi match CV với các job:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};
