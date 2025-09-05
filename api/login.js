import { users, verifyPassword } from "./_store.js";
import { readJson } from "./_auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }
  try {
    const { email, password } = await readJson(req);
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "email and password are required" });
    }
    const doc = users.get(email);
    if (!doc || !verifyPassword(password, doc.passHash, doc.salt)) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    return res.status(200).json({
      success: true,
      message: "Logged in",
      data: { email: doc.email, apiKey: doc.apiKey, tier: doc.tier }
    });
  } catch {
    return res.status(400).json({ success: false, message: "Invalid JSON body" });
  }
}
