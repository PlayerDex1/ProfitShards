import { ensureMigrations } from "../../_lib/migrations";

export interface Env { DB: D1Database }

export async function onRequestGet({ env, request }: { env: Env; request: Request }) {
  await ensureMigrations(env);
  
  const cookies = request.headers.get('cookie');
  if (!cookies) {
    return Response.json({ user: null });
  }

  const sessionMatch = cookies.match(/ps_session=([^;]+)/);
  if (!sessionMatch) {
    return Response.json({ user: null });
  }

  const sessionId = sessionMatch[1];
  const now = Date.now();

  try {
    const session = await env.DB.prepare(`
      SELECT s.session_id, s.user_id, s.expires_at, u.email, u.username
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.session_id = ? AND s.expires_at > ?
    `).bind(sessionId, now).first<{
      session_id: string;
      user_id: string;
      expires_at: number;
      email: string;
      username: string;
    }>();

    if (!session) {
      return Response.json({ user: null });
    }

    return Response.json({
      user: {
        id: session.user_id,
        email: session.email,
        username: session.username
      }
    });
  } catch (error) {
    console.error('Session lookup error:', error);
    return Response.json({ user: null });
  }
}