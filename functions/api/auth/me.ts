import { ensureMigrations } from "../../_lib/migrations";

export interface Env { DB: D1Database }

function getSessionIdFromCookie(req: Request) {
  const cookie = req.headers.get('Cookie') || '';
  const m = /(?:^|; )ps_session=([^;]+)/.exec(cookie);
  return m ? decodeURIComponent(m[1]) : null;
}

export async function onRequestGet({ env, request }: { env: Env; request: Request }) {
  try {
    await ensureMigrations(env as any);
    const sid = getSessionIdFromCookie(request);
    if (!sid) return new Response(JSON.stringify({ user: null }), { headers: { 'Content-Type': 'application/json' } });
    const row = await (env as any).DB.prepare(`SELECT u.id, u.email, u.username FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.session_id = ? AND s.expires_at > ?`).bind(sid, Date.now()).first<{ id: string; email: string; username: string }>();
    return new Response(JSON.stringify({ user: row || null }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: String(err?.message || err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

