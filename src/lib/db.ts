import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "digi.db");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const globalForDb = globalThis as unknown as { digiDb?: Database.Database };

export const db: Database.Database =
  globalForDb.digiDb ?? new Database(DB_PATH);

if (process.env.NODE_ENV !== "production") globalForDb.digiDb = db;

try {
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
} catch {
  // Read-only filesystem on serverless platforms
}

export type UserRole = "admin" | "customer";
export type UserStatus = "active" | "banned";

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: UserRole;
  status?: UserStatus;
  created_at: string;
}

export interface CategoryRow {
  id: string;
  slug: string;
  name: string;
  icon: string;
}

export interface ProductRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  category_id: string;
  price_cents: number;
  image: string;
  license_payload: string;
  featured: number;
  in_stock: number;
  created_at: string;
}

export interface OrderRow {
  id: string;
  user_id: string | null;
  email: string;
  name: string;
  total_cents: number;
  status: string;
  created_at: string;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  product_id: string;
  title: string;
  price_cents: number;
}

export interface LicenseRow {
  id: string;
  order_id: string;
  product_id: string;
  key: string;
  qr_secret: string;
  created_at: string;
}

export function initDb() {
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'customer',
        status TEXT NOT NULL DEFAULT 'active',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    try {
      db.exec(`ALTER TABLE users ADD COLUMN status TEXT NOT NULL DEFAULT 'active';`);
    } catch {
      // Column may already exist
    }

    db.exec(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        icon TEXT NOT NULL DEFAULT 'package'
      );

      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category_id TEXT NOT NULL REFERENCES categories(id),
        price_cents INTEGER NOT NULL,
        image TEXT NOT NULL,
        license_payload TEXT NOT NULL,
        featured INTEGER NOT NULL DEFAULT 0,
        in_stock INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id),
        email TEXT NOT NULL,
        name TEXT NOT NULL,
        total_cents INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'paid',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id TEXT NOT NULL REFERENCES products(id),
        title TEXT NOT NULL,
        price_cents INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS licenses (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id TEXT NOT NULL REFERENCES products(id),
        key TEXT NOT NULL,
        qr_secret TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
      CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
      CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
      CREATE INDEX IF NOT EXISTS idx_licenses_order ON licenses(order_id);
      CREATE INDEX IF NOT EXISTS idx_licenses_product ON licenses(product_id);
    `);
  } catch {
    // Read-only filesystem on serverless deployment
  }
}

export const formatMoney = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
