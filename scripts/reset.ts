import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "digi.db");

if (fs.existsSync(DB_PATH)) {
  fs.rmSync(DB_PATH, { force: true });
  // Remove WAL/SHM sidecar files too
  for (const ext of ["-wal", "-shm"]) {
    const sidecar = DB_PATH + ext;
    if (fs.existsSync(sidecar)) fs.rmSync(sidecar, { force: true });
  }
  console.log(`🗑️  Removed database at ${DB_PATH}`);
} else {
  console.log("No database found — nothing to reset.");
}

console.log("Run `npm run seed` to recreate the database.");
