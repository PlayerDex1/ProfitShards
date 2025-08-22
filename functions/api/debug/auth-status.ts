import { ensureMigrations } from "../../_lib/migrations";

export interface Env {
  DB: D1Database;
}

export async function onRequestGet({ env, request }: { env: Env; request: Request }) {
  try {
    // Run migrations automatically
    await ensureMigrations(env);
    
    const url = new URL(request.url);
    const cookie = request.headers.get('Cookie');
    
    // Get basic info
    const info = {
      timestamp: new Date().toISOString(),
      hostname: url.hostname,
      cookie: cookie || 'No cookie',
      userAgent: request.headers.get('User-Agent') || 'Unknown'
    };

    // Check database tables
    const tables = await env.DB.prepare(`
      SELECT name FROM sqlite_master WHERE type='table'
    `).all();

    // Check users count
    const usersCount = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM users
    `).first();

    // Check sessions count
    const sessionsCount = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM sessions WHERE expires_at > ?
    `).bind(Date.now()).first();

    // Check if there's a valid session
    let sessionInfo = null;
    if (cookie) {
      const sessionMatch = cookie.match(/ps_session=([^;]+)/);
      if (sessionMatch) {
        const sessionId = sessionMatch[1];
        const session = await env.DB.prepare(`
          SELECT s.session_id, s.user_id, s.expires_at, u.email, u.username
          FROM sessions s
          JOIN users u ON s.user_id = u.id
          WHERE s.session_id = ?
        `).bind(sessionId).first();
        
        sessionInfo = session ? {
          sessionId: session.session_id,
          userId: session.user_id,
          email: session.email,
          username: session.username,
          expiresAt: new Date(session.expires_at).toISOString(),
          isValid: session.expires_at > Date.now()
        } : 'Session not found in database';
      }
    }

    // Recent users (last 5)
    const recentUsers = await env.DB.prepare(`
      SELECT id, email, username, google_sub, email_verified, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 5
    `).all();

    const response = {
      info,
      database: {
        tables: tables.results.map(t => t.name),
        usersCount: usersCount?.count || 0,
        activeSessions: sessionsCount?.count || 0
      },
      session: sessionInfo,
      recentUsers: recentUsers.results.map(u => ({
        id: u.id,
        email: u.email,
        username: u.username,
        hasGoogleSub: !!u.google_sub,
        emailVerified: u.email_verified,
        createdAt: u.created_at ? new Date(u.created_at).toISOString() : null
      }))
    };

    return Response.json(response, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    return Response.json({
      error: error.message,
      stack: error.stack
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}