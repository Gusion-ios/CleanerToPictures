import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';
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
              const {prompt} = JSON.parse(body || '{}');
              const apiKey = process.env.GEMINI_API_KEY;
              if (!apiKey) {
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(
                  JSON.stringify({
                    success: true,
                    text: `SwipeClean Engine: Organizando fotos con éxito.`,
                    simulated: true,
                  })
                );
                return;
              }

              const ai = new GoogleGenAI({apiKey});
              const response = await ai.models.generateContent({
                model: 'gemini-3.8-flash',
                contents: prompt || 'Analiza y clasifica la imagen',
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
                  error: err?.message || 'Error en Gemini',
                })
              );
            }
          });
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      serverApiPlugin(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['apple-touch-icon.png', 'icon.svg'],
        manifest: {
          id: '/',
          name: 'SwipeClean - Limpiador de Fotos',
          short_name: 'SwipeClean',
          description: 'Limpia y organiza tus fotos deslizando al estilo Tinder.',
          theme_color: '#020617',
          background_color: '#020617',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
