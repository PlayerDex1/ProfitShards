export interface Env {
  DB: D1Database;
}

type HistoryItem = {
  timestamp: number;
  formData: any;
  results: any;
};

async function ensureTables(env: Env) {
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS history_items (
      user TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      data TEXT NOT NULL,
      PRIMARY KEY (user, timestamp)
    )`
  ).run();
}

export async function onRequestGet(context: { env: Env; request: Request }) {
  try {
    const { env, request } = context;
    if (!env || !env.DB) {
      return new Response(JSON.stringify({ error: 'D1 binding DB not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    await ensureTables(env);
    const url = new URL(request.url);
    const user = url.searchParams.get('user')?.trim();
    const limit = Math.min(Number(url.searchParams.get('limit') || '50'), 200);
    if (!user) {
      return new Response(JSON.stringify({ error: 'missing user' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const { results } = await env.DB.prepare(
      `SELECT timestamp, data FROM history_items WHERE user = ? ORDER BY timestamp ASC LIMIT ?`
    ).bind(user, limit).all<{ timestamp: number; data: string }>();

    const items: HistoryItem[] = (results || []).map((row) => {
      try {
        const parsed = JSON.parse(row.data);
        return { timestamp: row.timestamp, ...parsed } as HistoryItem;
      } catch {
        return { timestamp: row.timestamp, formData: {}, results: {} } as HistoryItem;
      }
    });

    return new Response(JSON.stringify(items), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: String(err?.message || err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function onRequestPost(context: { env: Env; request: Request }) {
  try {
    const { env, request } = context;
    if (!env || !env.DB) {
      return new Response(JSON.stringify({ error: 'D1 binding DB not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    await ensureTables(env);
    const body = await request.json().catch(() => null) as { user?: string; item?: HistoryItem } | null;
    const user = body?.user?.trim();
    const item = body?.item;
    if (!user || !item) {
      return new Response(JSON.stringify({ error: 'missing user or item' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    const data = JSON.stringify({ formData: item.formData, results: item.results });
    await env.DB.prepare(`INSERT OR REPLACE INTO history_items(user, timestamp, data) VALUES (?, ?, ?)`)
      .bind(user, item.timestamp, data).run();
    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: String(err?.message || err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function onRequestDelete(context: { env: Env; request: Request }) {
  try {
    const { env, request } = context;
    if (!env || !env.DB) {
      return new Response(JSON.stringify({ error: 'D1 binding DB not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    await ensureTables(env);
    const url = new URL(request.url);
    const user = url.searchParams.get('user')?.trim();
    const ts = url.searchParams.get('timestamp');
    if (!user) {
      return new Response(JSON.stringify({ error: 'missing user' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (ts) {
      const timestamp = Number(ts);
      await env.DB.prepare(`DELETE FROM history_items WHERE user = ? AND timestamp = ?`).bind(user, timestamp).run();
    } else {
      await env.DB.prepare(`DELETE FROM history_items WHERE user = ?`).bind(user).run();
    }
    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: String(err?.message || err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}