export interface Env {
  DB: D1Database;
}

export async function onRequestPost({ env, request }: { env: Env; request: Request }) {
  try {
    console.log('🧹 Clearing expired sessions...');
    
    const now = Date.now();
    
    // Delete expired sessions
    const expiredResult = await env.DB.prepare(`
      DELETE FROM sessions WHERE expires_at <= ?
    `).bind(now).run();
    
    console.log('🗑️ Expired sessions deleted:', expiredResult.changes);
    
    // Get current stats
    const activeSessionsCount = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM sessions WHERE expires_at > ?
    `).bind(now).first();
    
    const totalUsersCount = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM users
    `).first();

    // List recent sessions for debug
    const recentSessions = await env.DB.prepare(`
      SELECT s.session_id, s.user_id, s.expires_at, u.email
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.expires_at > ?
      ORDER BY s.created_at DESC
      LIMIT 10
    `).bind(now).all();

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      stats: {
        expiredSessionsDeleted: expiredResult.changes,
        activeSessionsRemaining: activeSessionsCount?.count || 0,
        totalUsers: totalUsersCount?.count || 0
      },
      activeSessions: recentSessions.results.map(s => ({
        sessionId: s.session_id.substring(0, 8) + '...',
        email: s.email,
        expiresAt: new Date(s.expires_at).toISOString()
      }))
    };

    return Response.json(response, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('❌ Clear sessions error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}