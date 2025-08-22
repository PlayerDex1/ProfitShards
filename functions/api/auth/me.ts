import { ensureMigrations } from "../../_lib/migrations";

export interface Env {
  DB: D1Database;
}

export async function onRequestGet({ env, request }: { env: Env; request: Request }) {
  try {
    // Run migrations automatically
    await ensureMigrations(env);
    
    console.log('Auth me called from:', request.url);
    
    // Get session from cookie
    const cookie = request.headers.get('Cookie');
    console.log('Cookie header:', cookie);
    
    if (!cookie) {
      console.log('No cookie found');
      return Response.json({ user: null });
    }

    const sessionMatch = cookie.match(/ps_session=([^;]+)/);
    if (!sessionMatch) {
      console.log('No ps_session found in cookie');
      return Response.json({ user: null });
    }

    const sessionId = sessionMatch[1];
    console.log('Session ID found:', sessionId);

    // Check if session exists and is valid
    const session = await env.DB.prepare(
      'SELECT user_id FROM sessions WHERE session_id = ? AND expires_at > ?'
    ).bind(sessionId, Date.now()).first();

    if (!session) {
      console.log('Session not found or expired');
      return Response.json({ user: null });
    }

    console.log('Valid session found for user:', session.user_id);

    // Get user info
    const user = await env.DB.prepare(
      'SELECT id, email, username FROM users WHERE id = ?'
    ).bind(session.user_id).first();

    if (!user) {
      console.log('User not found for session');
      return Response.json({ user: null });
    }

    console.log('User authenticated:', user.email);

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