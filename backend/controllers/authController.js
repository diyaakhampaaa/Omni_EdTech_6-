import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { createUser, findUserByEmail, toPublicUser } from "../models/userStore.js";
import { signToken } from "../middleware/auth.js";

const VALID_ROLES = new Set(["teacher", "student"]);

export async function signup(req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ error: "name, email, and password are required." });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters." });
    }
    if (!VALID_ROLES.has(role)) {
      return res.status(400).json({ error: "role must be 'teacher' or 'student'." });
    }
    if (findUserByEmail(email)) {
      return res.status(409).json({ error: "An account with that email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = createUser({ id: uuidv4(), name: name.trim(), email, passwordHash, role });
    const token = signToken(user);

    return res.status(201).json({ token, user: toPublicUser(user) });
  } catch (err) {
    console.error("signup error:", err);
    return res.status(500).json({ error: "Failed to create account.", details: err.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password) {
      return res.status(400).json({ error: "email and password are required." });
    }

    const user = findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Incorrect email or password." });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ error: "Incorrect email or password." });
    }

    const token = signToken(user);
    return res.json({ token, user: toPublicUser(user) });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ error: "Failed to log in.", details: err.message });
  }
}

/** GET /api/auth/me — requires requireAuth middleware to have already run. */
export function me(req, res) {
  return res.json({ user: req.user });
}