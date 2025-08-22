import { ensureMigrations } from "../../_lib/migrations";

export interface Env { DB: D1Database }

export async function onRequestPost({ env, request }: { env: Env; request: Request }) {
  await ensureMigrations(env);
  
  const cookies = request.headers.get('cookie');
  if (cookies) {
    const sessionMatch = cookies.match(/ps_session=([^;]+)/);
    if (sessionMatch) {
      const sessionId = sessionMatch[1];
      
      // Delete session from database
      await env.DB.prepare('DELETE FROM sessions WHERE session_id = ?').bind(sessionId).run();
    }
  }

  // Clear session cookie
  const headers = new Headers({ 'Content-Type': 'application/json' });
  const host = new URL(request.url).host;
  const apex = host.replace(/^www\./, '');
  const cookieDomain = `.${apex}`;
  
  headers.append('Set-Cookie', `ps_session=; Path=/; Domain=${cookieDomain}; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
  
  return Response.json({ ok: true }, { headers });
}