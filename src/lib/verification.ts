import { db } from "./db";

export interface PendingVerification {
  email: string;
  code: string;
  name: string;
  passwordHash: string;
  expiresAt: number; // timestamp in ms
}

// In-memory store fallback (useful for serverless or rapid verification)
const memoryStore = new Map<string, PendingVerification>();

// Ensure table exists in SQLite
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS verification_codes (
      email TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
} catch {
  // Read-only filesystem fallback
}

export function savePendingVerification({
  email,
  code,
  name,
  passwordHash,
  ttlMinutes = 10,
}: {
  email: string;
  code: string;
  name: string;
  passwordHash: string;
  ttlMinutes?: number;
}) {
  const normalizedEmail = email.toLowerCase().trim();
  const expiresAt = Date.now() + ttlMinutes * 60 * 1000;

  const entry: PendingVerification = {
    email: normalizedEmail,
    code,
    name: name.trim(),
    passwordHash,
    expiresAt,
  };

  // 1. Save in memory store
  memoryStore.set(normalizedEmail, entry);

  // 2. Save in database table
  try {
    db.prepare(`
      INSERT INTO verification_codes (email, code, name, password_hash, expires_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(email) DO UPDATE SET
        code = excluded.code,
        name = excluded.name,
        password_hash = excluded.password_hash,
        expires_at = excluded.expires_at
    `).run(normalizedEmail, code, name.trim(), passwordHash, expiresAt);
  } catch {
    // Database fallback
  }
}

export function getPendingVerification(email: string): PendingVerification | null {
  const normalizedEmail = email.toLowerCase().trim();

  // Check memory store first
  const memEntry = memoryStore.get(normalizedEmail);
  if (memEntry && memEntry.expiresAt > Date.now()) {
    return memEntry;
  }

  // Check database table
  try {
    const row = db
      .prepare("SELECT * FROM verification_codes WHERE email = ?")
      .get(normalizedEmail) as
      | {
          email: string;
          code: string;
          name: string;
          password_hash: string;
          expires_at: number;
        }
      | undefined;

    if (row && row.expires_at > Date.now()) {
      return {
        email: row.email,
        code: row.code,
        name: row.name,
        passwordHash: row.password_hash,
        expiresAt: row.expires_at,
      };
    }
  } catch {
    // Database fallback
  }

  return null;
}

export function deletePendingVerification(email: string) {
  const normalizedEmail = email.toLowerCase().trim();
  memoryStore.delete(normalizedEmail);
  try {
    db.prepare("DELETE FROM verification_codes WHERE email = ?").run(normalizedEmail);
  } catch {
    // Database fallback
  }
}
