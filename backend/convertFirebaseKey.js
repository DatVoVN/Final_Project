// convertFirebaseKey.js
const fs = require("fs");
const path = require("path");

const json = require("./utils/serviceAccountKey.json");

const escape = (str) => str.replace(/\n/g, "\\n");

const lines = [
  `FIREBASE_TYPE=${json.type}`,
  `FIREBASE_PROJECT_ID=${json.project_id}`,
  `FIREBASE_PRIVATE_KEY_ID=${json.private_key_id}`,
  `FIREBASE_PRIVATE_KEY="${escape(json.private_key)}"`,
  `FIREBASE_CLIENT_EMAIL=${json.client_email}`,
  `FIREBASE_CLIENT_ID=${json.client_id}`,
  `FIREBASE_AUTH_URI=${json.auth_uri}`,
  `FIREBASE_TOKEN_URI=${json.token_uri}`,
  `FIREBASE_AUTH_PROVIDER_CERT_URL=${json.auth_provider_x509_cert_url}`,
  `FIREBASE_CLIENT_CERT_URL=${json.client_x509_cert_url}`,
  `FIREBASE_UNIVERSE_DOMAIN=${json.universe_domain}`,
  `FIREBASE_STORAGE_BUCKET=${json.project_id}.appspot.com`,
];

fs.writeFileSync(".env.firebase", lines.join("\n"), "utf-8");
console.log("✅ Đã tạo file .env.firebase");
