const pdfParse = require("pdf-parse");
const OpenAI = require("openai");
const fs = require("fs");
const JobPosting = require("../models/JobPosting");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const roleProfiles = JSON.parse(
  fs.readFileSync("./data/roleProfiles.json", "utf-8")
);
const cosine = (a, b) => {
  const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
  const magB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
  return dot / (magA * magB || 1e-6);
};
const canon = (s = "") => s.trim().toLowerCase();
const buildEmbeddingText = (data) => {
  return `Role: ${data.role || ""}. Skills: ${(data.skills || []).join(
    ", "
  )}. Edu: ${data.education || ""}. Exp: ${data.experience || ""}`;
};
function suggestRolesFromCV(cvSkills) {
  const cvCan = new Set((cvSkills || []).map(canon));
  const results = [];

  for (const role in roleProfiles) {
    const profile = roleProfiles[role];
    const reqs = (profile.requiredSkills || []).map(canon);
    const prefs = (profile.preferredSkills || []).map(canon);

    const hitReq = reqs.filter((r) => cvCan.has(r)).length;
    const hitPref = prefs.filter((p) => cvCan.has(p)).length;

    const score =
      (hitReq / (reqs.length || 1)) * 0.7 +
      (hitPref / (prefs.length || 1)) * 0.3;

    if (score >= 0.3) {
      results.push({
        role,
        score: +score.toFixed(3),
        reasoning: `Khớp ${hitReq}/${reqs.length} kỹ năng bắt buộc, ${hitPref}/${prefs.length} kỹ năng ưu tiên.`,
      });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

exports.matchJobsFromCVUpload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Chưa upload CV PDF" });
    const text = (await pdfParse(req.file.buffer)).text.slice(0, 3000);
    const prompt = `
Trích xuất thông tin từ CV sau. Trả về JSON:

{
  "role": "",
  "skills": [],
  "education": "",
  "experience": ""
}

CV:
"""${text}"""
`.trim();

    const gptResp = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 0,
      messages: [{ role: "user", content: prompt }],
    });

    const structuredInfo = JSON.parse(gptResp.choices[0].message.content);
    const cvSkills = structuredInfo.skills || [];

    const suggestedRoles = suggestRolesFromCV(cvSkills);
    const topRoles = suggestedRoles.map((r) => r.role.toLowerCase());

    const cvText = buildEmbeddingText(structuredInfo);
    const { data } = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: cvText,
    });
    const cvEmbedding = data[0].embedding;
    const jobs = await JobPosting.find({
      isActive: true,
      jobEmbedding: { $exists: true, $not: { $size: 0 } },
    }).lean();

    const matches = [];

    for (const job of jobs) {
      const sim = cosine(cvEmbedding, job.jobEmbedding);

      const jobRole = job.structuredInfo?.role?.toLowerCase() || "";
      const roleMatch = topRoles.includes(jobRole);
      const roleScore = roleMatch
        ? suggestedRoles.find((r) => r.role.toLowerCase() === jobRole)?.score ||
          0
        : 0;
      const bonus = roleMatch ? 0.2 : -0.05;

      const finalScore = 0.5 * sim + 0.4 * roleScore + bonus;

      if (finalScore >= 0.6) {
        matches.push({
          jobId: job._id,
          title: job.title,
          matchedRole: job.structuredInfo?.role || "N/A",
          similarity: +(sim * 100).toFixed(1),
          score: +finalScore.toFixed(3),
          reason: roleMatch
            ? suggestedRoles.find((r) => r.role.toLowerCase() === jobRole)
                ?.reasoning
            : "Phù hợp theo ngữ nghĩa (embedding)",
        });
      }
    }

    matches.sort((a, b) => b.score - a.score);

    return res.json({
      structuredCV: structuredInfo,
      suggestedRoles,
      matches,
    });
  } catch (err) {
    console.error("matchJobsFromCVUpload Error:", err);
    return res.status(500).json({ error: "Lỗi xử lý CV", detail: err.message });
  }
};
