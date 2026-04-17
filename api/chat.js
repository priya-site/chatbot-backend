export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    // ✅ IMPORTANT FIX
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const message = body?.message || "Hello";

    console.log("User message:", message);

    const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: message }]
        }
      ]
    })
  }
);

const data = await response.json();

console.log("Gemini full response:", JSON.stringify(data, null, 2));

const reply =
  data?.candidates?.[0]?.content?.parts?.[0]?.text ||
  "No response from Gemini";

    return res.status(200).json({ reply });

  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({ error: "AI request failed" });
  }
}