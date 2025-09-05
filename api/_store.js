// WARNING: In-memory (reset saat cold start). Ganti ke DB untuk production.
import crypto from "crypto";

// users: email -> { email, passHash, salt, apiKey, tier }
export const users = new Map();

// apiKeys: apiKey -> email
export const apiKeys = new Map();

// rateLimits: apiKey -> { windowStart: number, count: number }
export const rateLimits = new Map();

export function genApiKey() {
  return crypto.randomBytes(16).toString("hex");
}

export function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const passHash = crypto.pbkdf2Sync(password, salt, 64000, 32, "sha256").toString("hex");
  return { passHash, salt };
}

export function verifyPassword(password, passHash, salt) {
  const check = crypto.pbkdf2Sync(password, salt, 64000, 32, "sha256").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(check, "hex"), Buffer.from(passHash, "hex"));
}

export function upsertUser(email, password) {
  const { passHash, salt } = hashPassword(password);
  const apiKey = genApiKey();
  const doc = { email, passHash, salt, apiKey, tier: "free" };
  users.set(email, doc);
  apiKeys.set(apiKey, email);
  return doc;
}
