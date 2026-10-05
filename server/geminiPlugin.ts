import type { Plugin, ViteDevServer, PreviewServer } from 'vite';
import {
  analyzeTargetWithGemini,
  analyzeTargetDeterministic,
  analyzeZonesWithGemini,
  analyzeZonesDeterministic,
  chatWithGemini,
  chatDeterministic,
  TargetSensorPayload,
  ZoneClusterPayload,
  ChatMessage,
  ChatMissionContext,
} from './geminiService';
import fs from 'node:fs';
import path from 'node:path';

// Helper to load .env file manually into process.env if present
function ensureEnvLoaded() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf-8');
      content.split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [key, ...values] = trimmed.split('=');
          const val = values.join('=').trim().replace(/^["']|["']$/g, '');
          process.env[key.trim()] = val;
        }
      });
    } catch {
      // ignore
    }
  }
}

async function readJsonBody(req: any): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: any) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error('Invalid JSON in request body'));
      }
    });
    req.on('error', (err: any) => reject(err));
  });
}

function sendJson(res: any, status: number, data: any) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

export function geminiBackendPlugin(): Plugin {
  return {
    name: 'vite-plugin-gemini-backend',
    configureServer(server: ViteDevServer) {
      ensureEnvLoaded();
      registerGeminiRoutes(server.middlewares);
    },
    configurePreviewServer(server: PreviewServer) {
      ensureEnvLoaded();
      registerGeminiRoutes(server.middlewares);
    },
  };
}

function registerGeminiRoutes(middlewares: any) {
  middlewares.use(async (req: any, res: any, next: any) => {
    const url = req.url?.split('?')[0];

    // Status check endpoint
    if (url === '/api/gemini/status' && req.method === 'GET') {
      ensureEnvLoaded();
      const apiKey = process.env.GEMINI_API_KEY?.trim();
      const model = process.env.GEMINI_MODEL?.trim() || 'gemini-3.8-flash';
      return sendJson(res, 200, {
        available: true,
        configured: Boolean(apiKey && apiKey.length > 5),
        model,
        mode: apiKey && apiKey.length > 5 ? 'live' : 'simulation-fallback',
      });
    }

    // Target analysis endpoint
    if (url === '/api/gemini/analyze-target' && req.method === 'POST') {
      ensureEnvLoaded();
      try {
        const payload: TargetSensorPayload = await readJsonBody(req);
        const apiKey = process.env.GEMINI_API_KEY?.trim();
        const model = process.env.GEMINI_MODEL?.trim() || 'gemini-3.8-flash';

        if (apiKey && apiKey.length > 5) {
          try {
            const result = await analyzeTargetWithGemini(payload, apiKey, model);
            return sendJson(res, 200, result);
          } catch (apiErr: any) {
            console.warn('[Gemini Service] Live API call failed, using deterministic fallback:', apiErr.message);
            const fallback = analyzeTargetDeterministic(payload);
            return sendJson(res, 200, {
              ...fallback,
              apiNote: `Live Gemini failed (${apiErr.message}); computed via deterministic oceanographic engine.`,
            });
          }
        } else {
          const fallback = analyzeTargetDeterministic(payload);
          return sendJson(res, 200, fallback);
        }
      } catch (err: any) {
        return sendJson(res, 400, { error: err.message });
      }
    }

    // Spatial zones analysis endpoint
    if (url === '/api/gemini/analyze-zones' && req.method === 'POST') {
      ensureEnvLoaded();
      try {
        const body = await readJsonBody(req);
        const clusters: ZoneClusterPayload[] = body.clusters || [];
        const apiKey = process.env.GEMINI_API_KEY?.trim();
        const model = process.env.GEMINI_MODEL?.trim() || 'gemini-3.8-flash';

        if (apiKey && apiKey.length > 5) {
          try {
            const result = await analyzeZonesWithGemini(clusters, apiKey, model);
            return sendJson(res, 200, result);
          } catch (apiErr: any) {
            console.warn('[Gemini Service] Live zone analysis failed, using deterministic fallback:', apiErr.message);
            const fallback = analyzeZonesDeterministic(clusters);
            return sendJson(res, 200, fallback);
          }
        } else {
          const fallback = analyzeZonesDeterministic(clusters);
          return sendJson(res, 200, fallback);
        }
      } catch (err: any) {
        return sendJson(res, 400, { error: err.message });
      }
    }

    // Chatbot endpoint
    if (url === '/api/gemini/chat' && req.method === 'POST') {
      ensureEnvLoaded();
      try {
        const body = await readJsonBody(req);
        const messages: ChatMessage[] = body.messages || [];
        const context: ChatMissionContext = body.missionContext || {};
        const apiKey = process.env.GEMINI_API_KEY?.trim();
        const model = process.env.GEMINI_MODEL?.trim() || 'gemini-3.8-flash';

        if (apiKey && apiKey.length > 5) {
          try {
            const result = await chatWithGemini(messages, context, apiKey, model);
            return sendJson(res, 200, result);
          } catch (apiErr: any) {
            console.warn('[Gemini Chat] Live API call failed, using deterministic fallback:', apiErr.message);
            const fallback = chatDeterministic(messages, context);
            return sendJson(res, 200, fallback);
          }
        } else {
          const fallback = chatDeterministic(messages, context);
          return sendJson(res, 200, fallback);
        }
      } catch (err: any) {
        return sendJson(res, 400, { error: err.message });
      }
    }

    next();
  });
}
