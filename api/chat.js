export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { system, messages, provider } = req.body;
    const activeProvider = provider || process.env.AI_PROVIDER || 'anthropic';
    if (activeProvider === 'anthropic') {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514', max_tokens: 1000, system, messages })
      });
      return res.status(200).json(await resp.json());
    } else if (activeProvider === 'openrouter') {
      const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.OPENROUTER_API_KEY, 'HTTP-Referer': 'https://polynize.ai', 'X-Title': 'Polynize Agent Builder' },
        body: JSON.stringify({ model: process.env.OPENROUTER_MODEL || 'moonshotai/kimi-k2', messages: [{ role: 'system', content: system }, ...messages], max_tokens: 1000 })
      });
      const data = await resp.json();
      if (data.choices && data.choices.length > 0) return res.status(200).json({ content: [{ type: 'text', text: data.choices[0].message.content }] });
      return res.status(200).json(data);
    } else { return res.status(400).json({ error: 'Unknown provider: ' + activeProvider }); }
  } catch (error) { console.error('API proxy error:', error); return res.status(500).json({ error: 'Internal server error' }); }
}
