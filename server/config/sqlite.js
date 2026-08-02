import Database from "better-sqlite3";
import path from "path";
import crypto from "crypto";

const dbPath = path.resolve("database.sqlite");
const db = new Database(dbPath);

// Enable WAL mode for high concurrency
db.pragma("journal_mode = WAL");

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    _id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    credits INTEGER DEFAULT 100,
    createdAt TEXT,
    updatedAt TEXT
  );

  CREATE TABLE IF NOT EXISTS interviews (
    _id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    role TEXT NOT NULL,
    experience TEXT NOT NULL,
    mode TEXT NOT NULL,
    resumeText TEXT,
    questions TEXT,
    finalScore REAL DEFAULT 0,
    status TEXT DEFAULT 'Incompleted',
    createdAt TEXT,
    updatedAt TEXT
  );

  CREATE TABLE IF NOT EXISTS payments (
    _id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    planId TEXT,
    amount REAL,
    credits INTEGER,
    razorpayOrderId TEXT,
    razorpayPaymentId TEXT,
    status TEXT DEFAULT 'created',
    createdAt TEXT,
    updatedAt TEXT
  );
`);

export function generateObjectId() {
  return crypto.randomBytes(12).toString("hex");
}

export default db;
