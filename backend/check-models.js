import dotenv from "dotenv";
dotenv.config();

const key = process.env.GEMINI_API_KEY;

fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`)
  .then((r) => r.json())
  .then((data) => {
    const names = data.models?.map((m) => m.name) || [];
    console.log(JSON.stringify(names, null, 2));
  })
  .catch((err) => console.error("Error:", err));

  