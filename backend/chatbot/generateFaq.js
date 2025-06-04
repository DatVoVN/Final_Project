require("dotenv").config({ path: "../.env" });
const fs = require("fs");
const axios = require("axios");

const faq = JSON.parse(fs.readFileSync("faq.json", "utf-8"));

async function getEmbedding(text) {
  const res = await axios.post(process.env.EMBEDDING_API_URL, { text });
  return res.data.embedding;
}

async function generate() {
  for (const item of faq) {
    item.embedding = await getEmbedding(item.question);
  }

  fs.writeFileSync("faq_with_embeddings.json", JSON.stringify(faq, null, 2));
  console.log("✅ Lưu vào faq_with_embeddings.json");
}

generate().catch(console.error);
