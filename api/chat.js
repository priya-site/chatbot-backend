export default async function handler(req, res) {
  /* ================= CORS ================= */

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      reply: "Method not allowed"
    });
  }

  try {
    /* ================= SAFE BODY PARSING ================= */

    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body;

    const message = body?.message?.trim() || "";

    if (!message) {
      return res.status(200).json({
        reply: "Please enter a message."
      });
    }

    console.log("User Message:", message);
    console.log("OpenAI Key Exists:", !!process.env.OPENAI_API_KEY);

    /* ================= OPENAI API CALL ================= */

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are a helpful real estate assistant for PropertyHub.

Help users with:
- buying properties
- renting properties
- selling properties
- property suggestions

Keep replies short, professional, and helpful.`
            },
            {
              role: "user",
              content: message
            }
          ],
          temperature: 0.7,
          max_tokens: 300
        })
      }
    );

    const data = await response.json();

    console.log(
      "OpenAI Response:",
      JSON.stringify(data, null, 2)
    );

    /* ================= API ERROR ================= */

    if (data.error) {
      return res.status(200).json({
        reply: "API ERROR: " + data.error.message
      });
    }

    /* ================= SAFE REPLY ================= */

    const reply =
      data.choices?.[0]?.message?.content ||
      "Sorry, no response received.";

    return res.status(200).json({
      reply
    });

  } catch (error) {
    console.error("SERVER ERROR:", error);

    return res.status(500).json({
      reply: "Server error. Please try again."
    });
  }
}