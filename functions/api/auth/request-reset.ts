import { ensureMigrations } from "../../_lib/migrations";

export interface Env { DB: D1Database }

function isValidEmail(email: string) {
  return /.+@.+\..+/.test(email);
}

export async function onRequestPost({ env, request }: { env: Env; request: Request }) {
  try {
    await ensureMigrations(env as any);
    const body = await request.json().catch(() => null) as { email?: string } | null;
    const email = (body?.email || '').trim().toLowerCase();
    if (!isValidEmail(email)) return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
    const user = await (env as any).DB.prepare(`SELECT id FROM users WHERE email = ?`).bind(email).first<{ id: string }>();
    if (!user) return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
    const token = crypto.randomUUID();
    const now = Date.now();
    const expires = now + 1000 * 60 * 30; // 30 min
    await (env as any).DB.prepare(`INSERT OR REPLACE INTO password_resets(token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)`)
      .bind(token, user.id, now, expires).run();
    // Send email via MailChannels (built-in on Cloudflare) if available
    const origin = new URL(request.url);
    const resetUrl = `${origin.protocol}//${origin.host}/?resetToken=${encodeURIComponent(token)}`;
    const mailBody = {
      personalizations: [{ to: [{ email }] }],
      from: { email: 'no-reply@profitshards.online', name: 'ProfitShards' },
      subject: 'Reset de senha',
      content: [{ type: 'text/plain', value: `Use este link para resetar sua senha: ${resetUrl} (expira em 30 minutos).` }]
    };
    try {
      await fetch('https://api.mailchannels.net/tx/v1/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mailBody),
      });
    } catch {}
    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: String(err?.message || err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

