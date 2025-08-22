 },
});import { ensureMigrations } from "../../_lib/migrations";

export interface Env { DB: D1Database }

async function sha256(input: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

export async function onRequestPost({ env, request }: { env: Env; request: Request }) {
  try {
    await ensureMigrations(env as any);
    const body = await request.json().catch(() => null) as { email?: string; password?: string } | null;
    const email = (body?.email || '').trim().toLowerCase();
    const password = body?.password || '';
    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'missing_credentials' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    const row = await (env as any).DB.prepare(`SELECT id, pass_hash FROM users WHERE email = ?`).bind(email).first<{ id: string; pass_hash: string }>();
    if (!row) return new Response(JSON.stringify({ error: 'invalid_credentials' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    const pass_hash = await sha256(password);
    if (pass_hash !== row.pass_hash) return new Response(JSON.stringify({ error: 'invalid_credentials' }), { status: 401, headers: { 'Content-Type': 'application/json' } });

    const sessionId = crypto.randomUUID();
    const now = Date.now();
    const expires = now + 1000 * 60 * 60 * 24 * 7; // 7 dias
    await (env as any).DB.prepare(`INSERT INTO sessions(session_id, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)`).bind(sessionId, row.id, now, expires).run();

    const headers = new Headers({ 'Content-Type': 'application/json' });
    headers.append('Set-Cookie', `ps_session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60*60*24*7}`);
    return new Response(JSON.stringify({ ok: true }), { headers });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: String(err?.message || err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

