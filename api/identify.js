export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { image } = req.body;
  
  // This reads the key you added in Vercel Settings
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Server config error: Missing API Key' });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: "Identify the pokemon in this image. Return a JSON object with a single key 'pokemon' containing the name in lowercase. If no pokemon is clearly visible or it is a random object, set 'pokemon' to 'none'. Example: {\"pokemon\": \"pikachu\"}" },
              { inlineData: { mimeType: "image/jpeg", data: image } }
            ]
          }],
          generationConfig: { responseMimeType: "application/json" }
        })
      }
    );

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) throw new Error("Invalid AI response");

    res.status(200).json(JSON.parse(text));

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Analysis failed' });
  }
}
