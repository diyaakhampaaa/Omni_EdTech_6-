import jwt from "jsonwebtoken";
import { findUserById, toPublicUser } from "../models/userStore.js";

function getJwtSecret() {
  // Read lazily (not as a top-level constant) so dotenv.config() in
  // server.js has already run by the time this is actually needed — same
  // pattern used in services/geminiService.js.
  return process.env.JWT_SECRET || "dev_only_insecure_secret_change_me";
}

export function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, getJwtSecret(), { expiresIn: "7d" });
}

/** Requires a valid Authorization: Bearer <token> header. Attaches req.user. */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Not authenticated. Please log in." });
  }

  try {
    const payload = jwt.verify(token, getJwtSecret());
    const user = findUserById(payload.sub);
    if (!user) {
      return res.status(401).json({ error: "Session is no longer valid. Please log in again." });
    }
    req.user = toPublicUser(user);
    next();
  } catch (err) {
    return res.status(401).json({ error: "Session expired or invalid. Please log in again." });
  }
}

/** Use after requireAuth. Restricts access to one or more roles. */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: `This action requires the role: ${allowedRoles.join(" or ")}.` });
    }
    next();
  };
}