import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 120000, // AI passes (audit/transform) can take a while
});

const TOKEN_KEY = "accesslens-token";

// Attach the saved login token to every request automatically, since all
// lesson/chat/auth-protected endpoints now require it.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

/** Auth */
export async function signup({ name, email, password, role }) {
  const { data } = await api.post("/auth/signup", { name, email, password, role });
  return data; // { token, user }
}

export async function login({ email, password }) {
  const { data } = await api.post("/auth/login", { email, password });
  return data; // { token, user }
}

export async function fetchMe() {
  const { data } = await api.get("/auth/me");
  return data.user;
}

/** Module A — upload a source file + reference-book metadata to create a lesson. */
export async function uploadLesson({ file, title, subject, referenceBook, chapter, pageRange }) {
  const form = new FormData();
  form.append("file", file);
  form.append("title", title);
  form.append("subject", subject);
  form.append("referenceBook", referenceBook || "");
  form.append("chapter", chapter || "");
  form.append("pageRange", pageRange || "");

  const { data } = await api.post("/lessons/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.lesson;
}

export async function fetchLesson(lessonId) {
  const { data } = await api.get(`/lessons/${lessonId}`);
  return data.lesson;
}

export async function fetchLessons() {
  const { data } = await api.get(`/lessons`);
  return data.lessons;
}

/** Student — open a lesson using the short code their teacher shared. */
export async function joinLessonByCode(code) {
  const { data } = await api.post(`/lessons/join`, { code });
  return data.lesson;
}

/** Module B, Pass 1 */
export async function runAudit(lessonId) {
  const { data } = await api.post(`/lessons/${lessonId}/audit`);
  return data.lesson;
}

/** Module B, Pass 2 */
export async function runTransformation(lessonId) {
  const { data } = await api.post(`/lessons/${lessonId}/transform`);
  return data.lesson;
}

/** Module D — Ask AccessLens */
export async function askTutor(lessonId, question, history = []) {
  const { data } = await api.post(`/lessons/${lessonId}/chat`, { question, history });
  return data; // { answer, groundedIn }
}

export default api;

