export default async function handler(req, res) {

  // ✅ CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {

    // ✅ Safe body parsing
    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body;

    const message = body?.message || "Hello";

    console.log("User message:", message);

    console.log("Using key exists:", !!process.env.GEMINI_API_KEY);

    // ✅ FINAL WORKING GEMINI API CALL
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a helpful real estate assistant.\nUser: ${message}`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    // ✅ Debug log
    console.log(
      "Gemini full response:",
      JSON.stringify(data, null, 2)
    );

    // ❌ API Error Handling
    if (data.error) {
      console.log("Gemini Error:", data.error);

      return res.status(200).json({
        reply: "API ERROR: " + data.error.message
      });
    }

    // ✅ Safe reply extraction
    let reply = "No response from Gemini";

    if (
      data.candidates &&
      data.candidates.length > 0 &&
      data.candidates[0].content &&
      data.candidates[0].content.parts
    ) {
      reply = data.candidates[0].content.parts
        .map(part => part.text || "")
        .join("");
    }

    return res.status(200).json({
      reply
    });

  } catch (error) {
    console.error("SERVER ERROR:", error);

    return res.status(500).json({
      reply: "Server error. Try again."
    });
  }
}