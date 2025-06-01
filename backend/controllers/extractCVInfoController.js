const pdfParse = require("pdf-parse");
const OpenAI = require("openai");
const fs = require("fs");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const roleProfiles = JSON.parse(
  fs.readFileSync("./data/roleProfiles.json", "utf-8")
);

const canon = (s = "") => s.trim().toLowerCase();
function matchRolesFromCV(cvSkills) {
  const cvSet = new Set(cvSkills.map(canon));
  const result = [];

  for (const role in roleProfiles) {
    const profile = roleProfiles[role];
    const reqs = (profile.requiredSkills || []).map(canon);
    const prefs = (profile.preferredSkills || []).map(canon);

    const hitReq = reqs.filter((s) => cvSet.has(s));
    const hitPref = prefs.filter((s) => cvSet.has(s));

    const score =
      (hitReq.length / (reqs.length || 1)) * 0.7 +
      (hitPref.length / (prefs.length || 1)) * 0.3;

    if (score >= 0.3) {
      result.push({
        role,
        score: +score.toFixed(3),
        reasoning: `Khớp ${hitReq.length}/${reqs.length} kỹ năng bắt buộc và ${hitPref.length}/${prefs.length} kỹ năng ưu tiên.`,
      });
    }
  }

  return result.sort((a, b) => b.score - a.score);
}

exports.extractCVInfo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Vui lòng upload file CV (.pdf)" });
    }

    const pdfBuffer = req.file.buffer;
    const text = (await pdfParse(pdfBuffer)).text.slice(0, 3000);

    const prompt = `
Trích xuất thông tin từ nội dung CV sau và trả về đúng định dạng JSON (không giải thích gì khác):

{
  "role": "",
  "skills": [],
  "education": "",
  "experience": ""
}

CV:
"""${text}"""
`.trim();

    const { choices } = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 0,
      messages: [{ role: "user", content: prompt }],
    });

    const structured = JSON.parse(choices[0].message.content);
    const matchedRoles = matchRolesFromCV(structured.skills || []);

    return res.json({
      structuredInfo: structured,
      suggestedRoles: matchedRoles,
    });
  } catch (err) {
    console.error("extractCVInfo Error:", err);
    return res.status(500).json({ error: "Lỗi server", detail: err.message });
  }
};
