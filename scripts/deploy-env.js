const { execSync } = require('child_process');
require('dotenv').config({path: '.env.local'});
const fbBase64 = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY).toString('base64');
const gemini = process.env.GEMINI_API_KEY;
const jwt = "aloha-sovereign-key-2026"; // Fallback as ALOHA_BRIDGE_KEY

const cmd = `gcloud run services update aipyram-web --update-env-vars="GEMINI_API_KEY=${gemini},FIREBASE_SERVICE_ACCOUNT_KEY_BASE64=${fbBase64},JWT_SECRET=${jwt}" --region europe-west1 --project aipyram-web --quiet`;

try {
  console.log("Executing gcloud update...");
  const out = execSync(cmd, { stdio: 'inherit' });
  console.log("Success");
} catch(e) {
  console.error("Failed", e);
}
