const MOCK_REPLY =
  'I am NexusBot on the public demo. Gemini is optional here, so I am running in mock mode. Try NEXUS10 at checkout, switch Buyer / Seller / Admin from the header, or open B2B Enterprise for RFQ and Net-30.';

function readBody(req: { on: Function }): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: Buffer | string) => {
      body += chunk;
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

export default async function handler(
  req: { method?: string; on: Function },
  res: { setHeader: Function; statusCode: number; end: Function },
) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  let message = '';
  let history: Array<{ role: string; parts: Array<{ text: string }> }> = [];
  try {
    const parsed = JSON.parse((await readBody(req)) || '{}');
    message = typeof parsed.message === 'string' ? parsed.message.slice(0, 4000) : '';
    history = Array.isArray(parsed.history) ? parsed.history.slice(-12) : [];
  } catch {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'Invalid JSON' }));
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.statusCode = 200;
    res.end(JSON.stringify({ text: MOCK_REPLY }));
    return;
  }

  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [...history, { role: 'user', parts: [{ text: message }] }],
      config: {
        systemInstruction:
          'You are NexusBot, concierge for the NexusBazaar demo marketplace. Be concise. Do not claim production payments, JWT, or a live warehouse. Promo NEXUS10 is public; ELITEPRO needs Elite. Roles switch in the header.',
      },
    });
    res.statusCode = 200;
    res.end(JSON.stringify({ text: response.text || MOCK_REPLY }));
  } catch (err: unknown) {
    const detail = err instanceof Error ? err.message : 'Internal Server Error';
    res.statusCode = 200;
    res.end(JSON.stringify({ text: `${MOCK_REPLY} (${detail})` }));
  }
}
