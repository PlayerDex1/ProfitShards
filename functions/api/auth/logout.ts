import { ensureMigrations } from "../../_lib/migrations";

export interface Env { DB: D1Database }

function getSessionIdFromCookie(req: Request) {
  const cookie = req.headers.get('Cookie') || '';
  const m = /(?:^|; )ps_session=([^;]+)/.exec(cookie);
  return m ? decodeURIComponent(m[1]) : null;
}

export async function onRequestPost({ env, request }: { env: Env; request: Request }) {
  try {
    await ensureMigrations(env as any);
    const sid = getSessionIdFromCookie(request);
    if (sid) {
      await (env as any).DB.prepare(`DELETE FROM sessions WHERE session_id = ?`).bind(sid).run();
    }
    const headers = new Headers({ 'Content-Type': 'application/json' });
    headers.append('Set-Cookie', `ps_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
    return new Response(JSON.stringify({ ok: true }), { headers });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: String(err?.message || err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

