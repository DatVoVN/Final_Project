// suggestJobsFromCV.js
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

// Skill normalization map
const MAP = {
  javascript: ["js", "java script"],
  "node.js": ["node", "nodejs"],
  sql: ["structured query language"],
};
const canon = (s = "") => {
  const low = s.trim().toLowerCase();
  for (const [key, aliases] of Object.entries(MAP)) {
    if (low === key || aliases.includes(low)) return key;
  }
  return low;
};

// Extract key CV data via OpenAI
async function extractCVData(buffer) {
  const text = (await pdfParse(buffer)).text.slice(0, 3000);
  const prompt = `Trả JSON: {summary, skills[], education, experience}\nCV:\n"""${text}"""`;
  const { choices } = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    response_format: { type: "json_object" },
    messages: [{ role: "user", content: prompt }],
    temperature: 0,
  });
  return JSON.parse(choices[0].message.content);
}

// Suggest roles from CV content
async function suggestRoles(cvText) {
  const prompt = `Phân tích CV và đề xuất roles + reasoning JSON:\n{\n  \"roles\":[],\n  \"reasoning\":{}\n}\nCV:\n"""${cvText.slice(
    0,
    3000
  )}"""`;
  const { choices } = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    response_format: { type: "json_object" },
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  });
  return JSON.parse(choices[0].message.content);
}

// Rule-based scoring against role profiles
function ruleScore(cvSkills, roleKey) {
  const profile = roleProfiles[roleKey] || {};
  const cvCan = cvSkills.map(canon);
  const reqs = (profile.requiredSkills || []).map(canon);
  const prefs = (profile.preferredSkills || []).map(canon);
  const hitReq = reqs.filter((r) => cvCan.includes(r)).length;
  const hitPref = prefs.filter((p) => cvCan.includes(p)).length;
  return (
    (hitReq / (reqs.length || 1)) * 0.7 + (hitPref / (prefs.length || 1)) * 0.3
  );
}

exports.suggestJobsFromCV = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Chưa upload CV PDF" });

    // 1. Parse CV and get embedding
    const cvData = await extractCVData(req.file.buffer);
    const cvText = `Skills:${cvData.skills.join(",")} Edu:${
      cvData.education
    } Exp:${cvData.experience}`;
    const cvEmbedding = (
      await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: cvText,
      })
    ).data[0].embedding;

    const { roles, reasoning } = await suggestRoles(cvText);

    const jobs = await JobPosting.find({ isActive: true }).lean();
    const matches = [];

    for (const job of jobs) {
      // Ensure jobEmbedding exists
      if (!Array.isArray(job.jobEmbedding) || job.jobEmbedding.length === 0) {
        const embedSource = `${job.title} ${job.description} ${job.requirements}`;
        const { data } = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: embedSource,
        });
        job.jobEmbedding = data[0].embedding;
        await JobPosting.updateOne(
          { _id: job._id },
          { jobEmbedding: job.jobEmbedding }
        );
      }

      // Compute similarity
      const sim = cosine(cvEmbedding, job.jobEmbedding);
      const titleKey = job.title.trim().toLowerCase();

      // Flexible match: substring or exact
      const matchRole =
        roles.find((r) => titleKey.includes(r.toLowerCase())) ||
        roles.find((r) => r.toLowerCase().includes(titleKey));
      const rs = matchRole ? ruleScore(cvData.skills, matchRole) : 0;
      const bonus = matchRole ? 0.2 : -0.05;
      const finalScore = 0.5 * sim + 0.4 * rs + bonus;

      console.log(
        `Job: ${job.title} | sim: ${sim.toFixed(2)}, rule: ${rs.toFixed(
          2
        )}, final: ${finalScore.toFixed(2)}`
      );

      if (finalScore >= 0.2) {
        matches.push({
          jobId: job._id,
          title: job.title,
          role: matchRole || "N/A",
          similarity: +(sim * 100).toFixed(1),
          score: +finalScore.toFixed(3),
          reason: matchRole
            ? reasoning[matchRole] || "Rule & similarity"
            : "Similarity match",
        });
      }
    }

    matches.sort((a, b) => b.score - a.score);
    return res.json({ roles, matches });
  } catch (err) {
    console.error("suggestJobsFromCV Error:", err);
    return res.status(500).json({ error: "Server error", detail: err.message });
  }
};
