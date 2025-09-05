import { apiKeys, rateLimits } from "./_store.js";

// Limit: 12 requests / 60.000 ms per API key (free tier)
const WINDOW_MS = 60_000;
const MAX_REQ = 12;

export function withAuth(handler, { requireAuth = true } = {}) {
  return (req, res) => {
    if (!requireAuth) return handler(req, res);

    const key = req.headers["x-api-key"];
    if (!key || !apiKeys.has(key)) {
      return res.status(401).json({ success: false, message: "Invalid or missing API key" });
    }

    // Rate limiting
    const now = Date.now();
    const entry = rateLimits.get(key) || { windowStart: now, count: 0 };
    if (now - entry.windowStart >= WINDOW_MS) {
      entry.windowStart = now;
      entry.count = 0;
    }
    entry.count += 1;

    if (entry.count > MAX_REQ) {
      const retryAfter = Math.ceil((entry.windowStart + WINDOW_MS - now) / 1000);
      res.setHeader("Retry-After", String(retryAfter));
      return res.status(429).json({
        success: false,
        message: `Rate limit exceeded: max ${MAX_REQ}/minute on free tier`
      });
    }
    rateLimits.set(key, entry);

    return handler(req, res, { apiKey: key });
  };
}

// Helper JSON body (Vercel biasanya sudah parse, ini fallback)
export async function readJson(req) {
  if (req.body) return req.body;
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", chunk => (data += chunk));
    req.on("end", () => {
      try { resolve(data ? JSON.parse(data) : {}); } catch (e) { reject(e); }
    });
    req.on("error", reject);
  });
      }
