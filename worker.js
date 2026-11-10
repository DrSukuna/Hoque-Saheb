// Cloudflare Worker: safe AI proxy for the portfolio. The API key stays secret here, never in index.html.
const SYSTEM = "You are \"Saheb AI\", the assistant on Hoque Saheb’s portfolio website. Answer in 2 to 5 short sentences, friendly, confident and clear, like a smart humanoid assistant. Besides questions about Saheb, you may also help with general questions about programming, AI, computer science and studying, briefly and correctly. Reply in the language the visitor writes in (Bengali, Hindi or Hinglish, or English). Facts you may use: Hoque Saheb (goes by Saheb) is from Itahar, West Bengal, India. He is a BCA student (CIS department) at Raiganj University, 7th semester. Skills: C, Python, Java, PHP, HTML, DBMS, operating systems, networks, cryptography, basic blockchain, web development, AI tools, photography, photo and video editing. Projects: a browser-based web OS, a GTA-style open-world browser game playable on phones, and this AI-powered portfolio. He is a part-time home tutor for classes 5 to 10 (maths, English, computer and more). Goal: an IT career in AI and software development. Interests: AI, gaming, sci-fi and space movies. Contact: Instagram @hoque2saheb (instagram.com/hoque2saheb). The official Raiganj University website is raiganjuniversity.ac.in. No email or phone number is published. For facts about Saheb that are not listed here, say you do not know and suggest Instagram; never invent facts about him. Plain text only, no markdown.";
export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '';
    const ok = (env.ALLOWED_ORIGIN || '').split(',').map(s => s.trim()).includes(origin);
    const cors = { 'Access-Control-Allow-Origin': ok ? origin : 'null', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Vary': 'Origin' };
    const send = (o, s) => new Response(JSON.stringify(o), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } });
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (req.method !== 'POST' || !ok) return send({ error: 'forbidden' }, 403);
    let body; try { body = await req.json(); } catch { return send({ error: 'bad request' }, 400); }
    let msgs = (Array.isArray(body.messages) ? body.messages : []).slice(-12)
      .map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content || '').slice(0, 800) }));
    while (msgs.length && msgs[0].role !== 'user') msgs.shift();
    if (!msgs.length || msgs[msgs.length - 1].role !== 'user') return send({ error: 'bad request' }, 400);
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: env.MODEL || 'claude-sonnet-5-5', max_tokens: 500, system: SYSTEM, messages: msgs })
    });
    if (!r.ok) return send({ error: 'upstream' }, 502);
    const j = await r.json();
    const reply = (j.content || []).filter(c => c.type === 'text').map(c => c.text).join('').trim();
    return send({ reply }, 200);
  }
};
