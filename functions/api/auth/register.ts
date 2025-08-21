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

function isValidEmail(email: string) {
  return /.+@.+\..+/.test(email);
}

export async function onRequestPost({ env, request }: { env: Env; request: Request }) {
  try {
    await ensureMigrations(env as any);
    const body = await request.json().catch(() => null) as { email?: string; password?: string } | null;
    const email = (body?.email || '').trim().toLowerCase();
    const password = body?.password || '';
    if (!isValidEmail(email) || password.length < 6) {
      return new Response(JSON.stringify({ error: 'invalid email or password' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    // Check existing
    const existing = await (env as any).DB.prepare(`SELECT id FROM users WHERE email = ?`).bind(email).first<{ id: string }>();
    if (existing?.id) {
      return new Response(JSON.stringify({ error: 'email_already_registered' }), { status: 409, headers: { 'Content-Type': 'application/json' } });
    }
    const id = crypto.randomUUID();
    const pass_hash = await sha256(password);
    const now = Date.now();
    await (env as any).DB.prepare(`INSERT INTO users(id, email, pass_hash, created_at, email_verified) VALUES (?, ?, ?, ?, 0)`).bind(id, email, pass_hash, now).run();
    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: String(err?.message || err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

