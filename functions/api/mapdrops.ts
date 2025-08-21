export interface Env {
  DB: D1Database;
}

type MapDropEntry = {
  timestamp: number;
  mapSize: 'small' | 'medium' | 'large' | 'xlarge';
  tokensDropped: number;
  loads: number;
  totalLuck?: number;
  status?: 'excellent' | 'positive' | 'negative' | 'neutral';
};

async function ensureTables(env: Env) {
  await env.DB.exec(`
    CREATE TABLE IF NOT EXISTS map_drops (
      user TEXT NOT NULL,
      timestamp INTEGER PRIMARY KEY,
      data TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_mapdrops_user_time ON map_drops(user, timestamp);
  `);
}

export async function onRequestGet(context: { env: Env; request: Request }) {
  const { env, request } = context;
  await ensureTables(env);
  const url = new URL(request.url);
  const user = url.searchParams.get('user')?.trim();
  const limit = Math.min(Number(url.searchParams.get('limit') || '200'), 1000);
  if (!user) {
    return new Response(JSON.stringify({ error: 'missing user' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const { results } = await env.DB.prepare(
    `SELECT timestamp, data FROM map_drops WHERE user = ? ORDER BY timestamp ASC LIMIT ?`
  ).bind(user, limit).all<{ timestamp: number; data: string }>();

  const items: MapDropEntry[] = (results || []).map((row) => {
    try {
      const parsed = JSON.parse(row.data);
      return { timestamp: row.timestamp, ...parsed } as MapDropEntry;
    } catch {
      return { timestamp: row.timestamp, mapSize: 'medium', tokensDropped: 0, loads: 0 } as MapDropEntry;
    }
  });

  return new Response(JSON.stringify(items), { headers: { 'Content-Type': 'application/json' } });
}

export async function onRequestPost(context: { env: Env; request: Request }) {
  const { env, request } = context;
  await ensureTables(env);
  const body = await request.json().catch(() => null) as { user?: string; entry?: MapDropEntry } | null;
  const user = body?.user?.trim();
  const entry = body?.entry;
  if (!user || !entry) {
    return new Response(JSON.stringify({ error: 'missing user or entry' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
  const data = JSON.stringify({ mapSize: entry.mapSize, tokensDropped: entry.tokensDropped, loads: entry.loads, totalLuck: entry.totalLuck, status: entry.status });
  await env.DB.prepare(`INSERT OR REPLACE INTO map_drops(user, timestamp, data) VALUES (?, ?, ?)`).bind(user, entry.timestamp, data).run();
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
}

export async function onRequestDelete(context: { env: Env; request: Request }) {
  const { env, request } = context;
  await ensureTables(env);
  const url = new URL(request.url);
  const user = url.searchParams.get('user')?.trim();
  const ts = url.searchParams.get('timestamp');
  if (!user) {
    return new Response(JSON.stringify({ error: 'missing user' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
  if (ts) {
    const timestamp = Number(ts);
    await env.DB.prepare(`DELETE FROM map_drops WHERE user = ? AND timestamp = ?`).bind(user, timestamp).run();
  } else {
    await env.DB.prepare(`DELETE FROM map_drops WHERE user = ?`).bind(user).run();
  }
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
}

