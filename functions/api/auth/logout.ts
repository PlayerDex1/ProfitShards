export interface Env {
  DB: D1Database;
}

export async function onRequestPost({ env, request }: { env: Env; request: Request }) {
  try {
    console.log('🚪 Logout request received');
    
    // Get session from cookie
    const cookie = request.headers.get('Cookie');
    console.log('🍪 Cookie for logout:', cookie);
    
    if (cookie) {
      const sessionMatch = cookie.match(/ps_session=([^;]+)/);
      if (sessionMatch) {
        const sessionId = sessionMatch[1];
        console.log('🔑 Deleting session:', sessionId);
        
        // Delete session from database
        const result = await env.DB.prepare(
          'DELETE FROM sessions WHERE session_id = ?'
        ).bind(sessionId).run();
        
        console.log('🗄️ Session deletion result:', result);
      }
    }

    // Clear cookies for all possible domains
    const url = new URL(request.url);
    const hostname = url.hostname;
    
    const headers = new Headers({
      'Content-Type': 'application/json'
    });

    // Clear cookie for current domain
    headers.append('Set-Cookie', 'ps_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
    
    // Clear cookie for .profitshards.online domain
    if (hostname.includes('profitshards.online')) {
      headers.append('Set-Cookie', 'ps_session=; Path=/; Domain=.profitshards.online; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
    }
    
    // Clear cookie for .pages.dev domain
    if (hostname.includes('pages.dev')) {
      headers.append('Set-Cookie', 'ps_session=; Path=/; Domain=.pages.dev; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
    }

    console.log('✅ Logout completed successfully');

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('❌ Logout error:', error);
    return new Response(JSON.stringify({ ok: false, error: 'logout_failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}