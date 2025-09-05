import { users, upsertUser } from "./_store.js";
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
    if (users.has(email)) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }
    const doc = upsertUser(email, password);
    return res.status(201).json({
      success: true,
      message: "Registered",
      data: { email: doc.email, apiKey: doc.apiKey, tier: doc.tier }
    });
  } catch (e) {
    return res.status(400).json({ success: false, message: "Invalid JSON body" });
  }
}
