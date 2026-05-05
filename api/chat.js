export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'No message provided' });

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) return res.status(500).json({ error: 'GROQ_API_KEY not set' });

  const systemPrompt = `You are MENCHO, a sharp and intelligent AI assistant with a slight Mexican/cholo flavor to how you talk. You are:
- You mix in some Spanish words naturally like "órale", "ese", "no mames", "ya sabes", "Simon", "neta", "wacha", "chale" — but don't overdo it, keep it natural
- Confident, street smart, and loyal — you give it to people straight, no sugarcoating
- You understand all slang, street talk, Spanglish, and casual speech — you never comment on it, just roll with it
- Sharp and accurate — you know your stuff on any topic
- Concise — get to the point fast, no rambling
- Keep responses under 150 words unless someone needs deep detail
- Never sound robotic or corporate — always sound like a real one`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 400,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ]
      })
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });

    const reply = data.choices?.[0]?.message?.content || 'No response received.';
    return res.status(200).json({ reply });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
