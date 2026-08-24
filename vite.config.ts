import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

const MOCK_REPLY =
  'Hello! I am NexusBot. GEMINI_API_KEY is not set, so I am running in mock mode. Try NEXUS10 at checkout or switch Buyer / Seller / Admin from the header.';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'gemini-api-middleware',
      configureServer(server) {
        server.middlewares.use('/api/gemini/chat', async (req, res) => {
          if (req.method !== 'POST') {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Method Not Allowed' }));
            return;
          }

          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const parsed = JSON.parse(body || '{}');
              const message = parsed.message || '';
              const history = parsed.history || [];
              const apiKey = process.env.GEMINI_API_KEY;

              if (!apiKey) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ text: MOCK_REPLY }));
                return;
              }

              const { GoogleGenAI } = await import('@google/genai');
              const ai = new GoogleGenAI({ apiKey });
              const response = await ai.models.generateContent({
                model: 'gemini-3.5-flash',
                contents: [
                  ...history,
                  { role: 'user', parts: [{ text: message }] },
                ],
                config: {
                  systemInstruction:
                    'You are NexusBot, concierge for the NexusBazaar demo marketplace. Be concise. Do not claim production payments or a live warehouse.',
                },
              });

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ text: response.text }));
            } catch (err: unknown) {
              const detail = err instanceof Error ? err.message : 'Internal Server Error';
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ text: `${MOCK_REPLY} (${detail})` }));
            }
          });
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    port: 3000,
    host: true,
    hmr: process.env.DISABLE_HMR !== 'true',
  },
  preview: {
    port: 4173,
    host: true,
  },
});
