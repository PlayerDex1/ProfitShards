export interface Env {
  DB: D1Database;
}

export async function onRequestPost({ env, request }: { env: Env; request: Request }) {
  try {
    // Get session from cookie
    const cookie = request.headers.get('Cookie');
    if (cookie) {
      const sessionMatch = cookie.match(/ps_session=([^;]+)/);
      if (sessionMatch) {
        const sessionId = sessionMatch[1];
        
        // Delete session from database
        await env.DB.prepare(
          'DELETE FROM sessions WHERE session_id = ?'
        ).bind(sessionId).run();
      }
    }

    // Clear cookie and return success
    const headers = new Headers({
      'Set-Cookie': 'ps_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0'
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Logout error:', error);
    return new Response(JSON.stringify({ ok: false, error: 'logout_failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}