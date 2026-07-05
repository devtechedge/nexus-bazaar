import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
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
            req.on('data', chunk => {
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
                  res.end(JSON.stringify({ 
                    text: "Hello! I am NexusBot. It looks like the GEMINI_API_KEY is not configured yet in Settings > Secrets. Once configured, I will be fully active to answer all your e-commerce questions! For now, how can I help you conceptually?" 
                  }));
                  return;
                }

                const { GoogleGenAI } = await import('@google/genai');
                const ai = new GoogleGenAI({
                  apiKey,
                  httpOptions: {
                    headers: {
                      'User-Agent': 'aistudio-build',
                    }
                  }
                });

                const systemInstruction = `You are "NexusBot", the official elite virtual concierge for NexusBazaar—the next-generation decentralized e-commerce marketplace.
Your role is to help buyers with support queries, shipping tracking, elite membership benefits, product recommendations, and refunds.
Be polite, professional, extremely concise, and helpful. Always maintain the premium, high-tech NexusBazaar brand aesthetic.
If the buyer asks about their account or orders, guide them on using the profile switches or the order history view in the header. Do not reference South American rivers or existing corporate brands. Keep answers under 100 words where possible.`;

                const response = await ai.models.generateContent({
                  model: 'gemini-3.5-flash',
                  contents: [
                    ...history,
                    { role: 'user', parts: [{ text: message }] }
                  ],
                  config: {
                    systemInstruction,
                  }
                });

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ text: response.text }));
              } catch (err: any) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
              }
            });
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
