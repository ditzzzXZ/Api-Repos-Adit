import { withAuth, readJson } from "./_auth.js";
import { vouchers } from "./voucher.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }
  return withAuth(async (req2, res2) => {
    const { code } = await readJson(req2);
    if (!code) return res2.status(400).json({ success: false, message: "code is required" });

    const v = vouchers.get(code);
    if (!v) return res2.status(404).json({ success: false, message: "Voucher not found" });
    if (v.used) return res2.status(400).json({ success: false, message: "Voucher already used" });

    v.used = true;
    return res2.status(200).json({ success: true, code, amount: v.amount });
  })(req, res);
}
