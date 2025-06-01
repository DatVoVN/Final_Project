const crypto = require("crypto");
const { OpenAI } = require("openai");
const JobPosting = require("./models/JobPosting");
const Company = require("./models/Company");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const conversations = new Map();
function pruneHistory(history, limit = 40) {
  return history.slice(-limit);
}
function composeSystemPrompt(job, company) {
  const parts = [
    "You are an HR assistant answering candidate questions about job postings and companies. Keep answers clear, concise (max 200 words), and accurate.",
  ];
  parts.push(`JOB TITLE: ${job.title}`);
  parts.push(`DESCRIPTION: ${job.description}`);
  parts.push(`REQUIREMENTS: ${job.requirements}`);
  if (job.salary) parts.push(`SALARY: ${job.salary.toLocaleString()} VND`);
  if (job.locationType) parts.push(`LOCATION TYPE: ${job.locationType}`);
  if (job.jobType) parts.push(`JOB TYPE: ${job.jobType}`);
  if (job.experienceLevel)
    parts.push(`EXPERIENCE LEVEL: ${job.experienceLevel}`);
  if (job.languages?.length)
    parts.push(`LANGUAGES: ${job.languages.join(", ")}`);
  if (job.benefits?.length) parts.push(`BENEFITS: ${job.benefits.join(", ")}`);
  if (job.deadline)
    parts.push(`DEADLINE: ${job.deadline.toISOString().split("T")[0]}`);
  if (company) {
    parts.push(`\nCOMPANY NAME: ${company.name}`);
    if (company.overview) parts.push(`OVERVIEW: ${company.overview}`);
    if (company.description) parts.push(`DESCRIPTION: ${company.description}`);
    if (company.address) parts.push(`ADDRESS: ${company.address}`);
    if (company.city) parts.push(`CITY: ${company.city}`);
    if (company.email) parts.push(`CONTACT EMAIL: ${company.email}`);
    if (company.companySize) parts.push(`COMPANY SIZE: ${company.companySize}`);
    if (company.languages?.length)
      parts.push(`WORKING LANGUAGES: ${company.languages.join(", ")}`);
    if (company.workingDays)
      parts.push(
        `WORKING DAYS: ${company.workingDays.from} - ${company.workingDays.to}`
      );
  }
  if (job.structuredInfo && Object.keys(job.structuredInfo).length) {
    parts.push(`STRUCTURED INFO: ${JSON.stringify(job.structuredInfo)}`);
  }
  if (job.chatbotContext) {
    parts.push(`EXTRA CONTEXT: ${job.chatbotContext}`);
  }

  return parts.join("\n");
}
async function getCompletion(messages) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages,
  });
  return response.choices[0].message.content.trim();
}
exports.chat = async (req, res) => {
  const { conversationId, message } = req.body;
  if (!message) return res.status(400).json({ error: "message is required" });

  try {
    const id = conversationId || crypto.randomUUID();
    const history = conversations.get(id) || [];
    history.push({ role: "user", content: message });
    const reply = await getCompletion(history);
    history.push({ role: "assistant", content: reply });
    conversations.set(id, pruneHistory(history));
    res.json({ conversationId: id, reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Chat failed" });
  }
};
exports.chatJob = async (req, res) => {
  const { jobId } = req.params;
  const { conversationId, message } = req.body;
  if (!message) return res.status(400).json({ error: "message is required" });

  try {
    const job = await JobPosting.findById(jobId).lean();
    if (!job) return res.status(404).json({ error: "Job not found" });

    let company = null;
    if (job.company) {
      company = await Company.findById(job.company).lean();
    }
    const systemContent = composeSystemPrompt(job, company);
    const systemMsg = { role: "system", content: systemContent };

    const id = conversationId || crypto.randomUUID();
    const history = conversations.get(id) || [];
    if (!history.length || history[0].role !== "system") {
      history.unshift(systemMsg);
    }
    history.push({ role: "user", content: message });

    const reply = await getCompletion(history);
    history.push({ role: "assistant", content: reply });
    conversations.set(id, pruneHistory(history));

    res.json({ conversationId: id, reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Job chat failed" });
  }
};
