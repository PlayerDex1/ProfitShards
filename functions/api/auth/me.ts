export interface Env {
  DB: D1Database;
}

export async function onRequestGet({ env, request }: { env: Env; request: Request }) {
  try {
    // Get session from cookie
    const cookie = request.headers.get('Cookie');
    if (!cookie) {
      return Response.json({ user: null });
    }

    const sessionMatch = cookie.match(/ps_session=([^;]+)/);
    if (!sessionMatch) {
      return Response.json({ user: null });
    }

    const sessionId = sessionMatch[1];

    // Check if session exists and is valid
    const session = await env.DB.prepare(
      'SELECT user_id FROM sessions WHERE session_id = ? AND expires_at > ?'
    ).bind(sessionId, Date.now()).first();

    if (!session) {
      return Response.json({ user: null });
    }

    // Get user info
    const user = await env.DB.prepare(
      'SELECT id, email, username FROM users WHERE id = ?'
    ).bind(session.user_id).first();

    if (!user) {
      return Response.json({ user: null });
    }

    return Response.json({ 
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      }
    });

  } catch (error) {
    console.error('Auth me error:', error);
    return Response.json({ user: null });
  }
}