import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, type RunRecord } from "./storage";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // Simple API key middleware for test
  const API_KEY = process.env.RUNS_API_KEY || "dev-test-key";
  function requireApiKey(req: any, res: any, next: any) {
    const key = req.header('x-api-key');
    if (!key || key !== API_KEY) {
      return res.status(401).json({ message: 'unauthorized' });
    }
    next();
  }

  // Ingest a dungeon run result (test endpoint)
  app.post('/api/runs', requireApiKey, async (req, res) => {
    try {
      const { userId, dungeonId, tokensFarmed, tokensAccelerated, timestamp } = req.body || {};
      if (!userId || !dungeonId || typeof tokensFarmed !== 'number' || typeof tokensAccelerated !== 'number') {
        return res.status(400).json({ message: 'invalid_payload' });
      }
      const netTokens = Math.max(0, tokensFarmed - tokensAccelerated);
      const run: RunRecord = {
        id: randomUUID(),
        userId,
        dungeonId,
        tokensFarmed,
        tokensAccelerated,
        netTokens,
        timestamp: typeof timestamp === 'number' ? timestamp : Date.now(),
      };
      await storage.addRun(run);
      return res.json({ ok: true, run });
    } catch (e: any) {
      return res.status(500).json({ message: 'error', detail: e?.message });
    }
  });

  // List recent runs (test endpoint)
  app.get('/api/runs', requireApiKey, async (_req, res) => {
    const items = await storage.listRuns(50);
    res.json({ items });
  });

  const httpServer = createServer(app);

  return httpServer;
}
