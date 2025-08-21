import { ensureMigrations } from "../../_lib/migrations";

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
    const body = await request.json().catch(() => null) as { token?: string; password?: string } | null;
    const token = (body?.token || '').trim();
    const password = body?.password || '';
    if (!token || password.length < 6) return new Response(JSON.stringify({ error: 'invalid_request' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    const row = await (env as any).DB.prepare(`SELECT user_id, expires_at FROM password_resets WHERE token = ?`).bind(token).first<{ user_id: string; expires_at: number }>();
    if (!row || row.expires_at < Date.now()) return new Response(JSON.stringify({ error: 'invalid_or_expired_token' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    const pass_hash = await sha256(password);
    await (env as any).DB.prepare(`UPDATE users SET pass_hash = ? WHERE id = ?`).bind(pass_hash, row.user_id).run();
    await (env as any).DB.prepare(`DELETE FROM password_resets WHERE token = ?`).bind(token).run();
    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: String(err?.message || err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

