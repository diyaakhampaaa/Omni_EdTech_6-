/**
 * User accounts, backed by a JSON file on disk so they survive backend
 * restarts — same pattern as lessonStore.js. Still a stand-in for a real
 * database; swap for Postgres/Mongo before running multiple server instances
 * or storing real users' data long-term.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const usersByEmail = new Map();
const usersById = new Map();

try {
  if (fs.existsSync(USERS_FILE)) {
    const raw = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
    for (const user of Object.values(raw)) {
      usersByEmail.set(user.email, user);
      usersById.set(user.id, user);
    }
    console.log(`Loaded ${usersById.size} saved user account(s) from disk.`);
  }
} catch (err) {
  console.error("Failed to load saved users, starting with an empty store:", err.message);
}

function persistUsers() {
  try {
    const obj = Object.fromEntries(usersById);
    fs.writeFileSync(USERS_FILE, JSON.stringify(obj, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save users to disk:", err.message);
  }
}

export function createUser({ id, name, email, passwordHash, role }) {
  const user = {
    id,
    name,
    email: email.toLowerCase(),
    passwordHash,
    role,
    createdAt: new Date().toISOString(),
  };
  usersByEmail.set(user.email, user);
  usersById.set(user.id, user);
  persistUsers();
  return user;
}

export function findUserByEmail(email) {
  return usersByEmail.get((email || "").toLowerCase()) || null;
}

export function findUserById(id) {
  return usersById.get(id) || null;
}

export function toPublicUser(user) {
  if (!user) return null;
  const { passwordHash, ...publicUser } = user;
  return publicUser;
}