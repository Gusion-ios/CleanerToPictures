import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import {GoogleGenAI} from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

function serverApiPlugin(): Plugin {
  return {
    name: 'server-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/gemini' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const {prompt, mode} = JSON.parse(body || '{}');
              const apiKey = process.env.GEMINI_API_KEY;
              if (!apiKey) {
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(
                  JSON.stringify({
                    success: true,
                    text: `[Modo Simulación Activo]: Procesé tu solicitud: "${prompt}". Como motor de software en Google AI Studio, domino arquitectura frontend, algoritmos complejos, Three.js 3D, y orquestación de sistemas. (Configura GEMINI_API_KEY en secrets para llamadas en vivo).`,
                    simulated: true,
                  })
                );
                return;
              }

              const ai = new GoogleGenAI({apiKey});
              const response = await ai.models.generateContent({
                model: 'gemini-3.8-flash',
                contents: prompt || 'Demuestra una de tus facultades de ingeniería en 2 párrafos concisos.',
              });

              res.writeHead(200, {'Content-Type': 'application/json'});
              res.end(
                JSON.stringify({
                  success: true,
                  text: response.text,
                  simulated: false,
                })
              );
            } catch (err: any) {
              res.writeHead(500, {'Content-Type': 'application/json'});
              res.end(
                JSON.stringify({
                  success: false,
                  error: err?.message || 'Error al procesar con Gemini',
                })
              );
            }
          });
          return;
        }

        if (req.url === '/api/status' && req.method === 'GET') {
          res.writeHead(200, {'Content-Type': 'application/json'});
          res.end(
            JSON.stringify({
              status: 'online',
              hasApiKey: !!process.env.GEMINI_API_KEY,
              model: 'gemini-3.8-flash',
              engine: 'Google AI Studio Engine',
              timestamp: new Date().toISOString(),
            })
          );
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), serverApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
