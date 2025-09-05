import crypto from "crypto";
import { withAuth, readJson } from "./_auth.js";

// In-memory store: code -> { amount, used, createdAt }
const vouchers = new Map();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }
  return withAuth(async (req2, res2) => {
    const { amount } = await readJson(req2);
    if (typeof amount !== "number" || amount <= 0) {
      return res2.status(400).json({ success: false, message: "amount must be > 0" });
    }
    const code = crypto.randomBytes(4).toString("hex");
    vouchers.set(code, { amount, used: false, createdAt: Date.now() });
    return res2.status(201).json({ success: true, code, amount });
  })(req, res);
}

export { vouchers };
