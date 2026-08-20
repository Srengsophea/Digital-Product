import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { unauthorized, forbidden } from "next/navigation";
import { db, type UserRow } from "./db";
import { firestoreDb, COLLECTIONS } from "./firebase-admin";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "digi-vip-dev-secret-change-me"
);

const COOKIE_NAME = "digi_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface SessionPayload {
  sub: string;
  email: string;
  name: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  if (!hash) return false;
  return bcrypt.compare(password, hash);
}

export async function createSession(user: UserRow): Promise<string> {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const isEnvAdmin = adminEmail && user.email.trim().toLowerCase() === adminEmail;
  const role = isEnvAdmin ? "admin" : user.role;

  return new SignJWT({
    email: user.email,
    name: user.name,
    role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(SECRET);
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return {
      sub: String(payload.sub),
      email: String(payload.email),
      name: String(payload.name),
      role: String(payload.role),
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireUser(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) unauthorized();
  return session;
}

export async function requireAdmin(): Promise<SessionPayload> {
  const session = await requireUser();
  if (session.role !== "admin") forbidden();
  return session;
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function saveUser(user: UserRow): Promise<void> {
  // 1. Save to SQLite
  try {
    db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        email = excluded.email,
        password_hash = excluded.password_hash,
        name = excluded.name,
        role = excluded.role
    `).run(user.id, user.email, user.password_hash, user.name, user.role, user.created_at);
  } catch {
    // Read-only filesystem fallback
  }

  // 2. Save to Cloud Firestore (persisted across all Vercel serverless containers)
  try {
    await firestoreDb.collection(COLLECTIONS.USERS).doc(user.id).set(user, { merge: true });
  } catch (err) {
    console.error("Failed to save user to Cloud Firestore:", err);
  }
}

export async function getUserById(id: string): Promise<UserRow | undefined> {
  // 1. Try SQLite first (fast)
  try {
    const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as
      | UserRow
      | undefined;
    if (row) return row;
  } catch {
    // Database fallback
  }

  // 2. Try Cloud Firestore
  try {
    const doc = await firestoreDb.collection(COLLECTIONS.USERS).doc(id).get();
    if (doc.exists) {
      const data = doc.data() as UserRow;
      // Cache in SQLite
      try {
        db.prepare(
          "INSERT OR IGNORE INTO users (id, email, password_hash, name, role, created_at) VALUES (?, ?, ?, ?, ?, ?)"
        ).run(data.id, data.email, data.password_hash, data.name, data.role, data.created_at);
      } catch {}
      return data;
    }
  } catch {
    // Firestore fallback
  }

  return undefined;
}

export async function getUserByEmail(email: string): Promise<UserRow | undefined> {
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Try SQLite first
  try {
    const row = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(normalizedEmail) as UserRow | undefined;
    if (row) return row;
  } catch {
    // Database fallback
  }

  // 2. Try Cloud Firestore (persisted users across serverless instances)
  try {
    const snap = await firestoreDb
      .collection(COLLECTIONS.USERS)
      .where("email", "==", normalizedEmail)
      .limit(1)
      .get();
    if (!snap.empty) {
      const data = snap.docs[0].data() as UserRow;
      // Cache in SQLite
      try {
        db.prepare(
          "INSERT OR IGNORE INTO users (id, email, password_hash, name, role, created_at) VALUES (?, ?, ?, ?, ?, ?)"
        ).run(data.id, data.email, data.password_hash, data.name, data.role, data.created_at);
      } catch {}
      return data;
    }
  } catch {
    // Firestore fallback
  }

  return undefined;
}
