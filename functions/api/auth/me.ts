import { ensureMigrations } from "../../_lib/migrations";
import { checkRateLimit, addSecurityHeaders, getClientIP } from "../../_lib/security";

export interface Env {
  DB: D1Database;
  KV?: KVNamespace;
}

export async function onRequestGet({ env, request }: { env: Env; request: Request }) {
  try {
    // Run migrations automatically
    await ensureMigrations(env);
    
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResult = await checkRateLimit(env, clientIP, 'api', request);
    
    if (!rateLimitResult.allowed) {
      console.log(`🚫 Rate limit exceeded for IP: ${clientIP}`);
      const response = Response.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
          }
        }
      );
      return addSecurityHeaders(response);
    }
    
    console.log('Auth me called from:', request.url);
    
    // Get session from cookie
    const cookie = request.headers.get('Cookie');
    console.log('Cookie header:', cookie);
    
    if (!cookie) {
      console.log('No cookie found');
      const response = Response.json({ user: null });
      return addSecurityHeaders(response);
    }

    const sessionMatch = cookie.match(/ps_session=([^;]+)/);
    if (!sessionMatch) {
      console.log('No ps_session found in cookie');
      const response = Response.json({ user: null });
      return addSecurityHeaders(response);
    }

    const sessionId = sessionMatch[1];
    console.log('Session ID found:', sessionId);

    // Check if session exists and is valid
    const session = await env.DB.prepare(
      'SELECT user_id FROM sessions WHERE session_id = ? AND expires_at > ?'
    ).bind(sessionId, Date.now()).first();

    if (!session) {
      console.log('Session not found or expired');
      const response = Response.json({ user: null });
      return addSecurityHeaders(response);
    }

    console.log('Valid session found for user:', session.user_id);

    // Get user info
    const user = await env.DB.prepare(
      'SELECT id, email, username FROM users WHERE id = ?'
    ).bind(session.user_id).first();

    if (!user) {
      console.log('User not found for session');
      const response = Response.json({ user: null });
      return addSecurityHeaders(response);
    }

    console.log('User authenticated:', user.email);

    const response = Response.json({ 
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      }
    });
    return addSecurityHeaders(response);

  } catch (error) {
    console.error('Auth me error:', error);
    const response = Response.json({ user: null });
    return addSecurityHeaders(response);
  }
}