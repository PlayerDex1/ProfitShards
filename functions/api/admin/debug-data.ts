import { addSecurityHeaders, checkRateLimit, getClientIP } from "../../_lib/security";

export interface Env {
  DB: D1Database;
  KV?: KVNamespace;
}

export async function onRequestGet({ env, request }: { env: Env; request: Request }) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResult = await checkRateLimit(env, clientIP, 'api', request);
    
    if (!rateLimitResult.allowed) {
      const response = Response.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
      return addSecurityHeaders(response);
    }

    // Verificar autenticação
    const cookie = request.headers.get('Cookie');
    if (!cookie) {
      const response = Response.json({ error: 'Authentication required' }, { status: 401 });
      return addSecurityHeaders(response);
    }

    const sessionMatch = cookie.match(/ps_session=([^;]+)/);
    if (!sessionMatch) {
      const response = Response.json({ error: 'Invalid session' }, { status: 401 });
      return addSecurityHeaders(response);
    }

    // Verificar se a sessão é válida
    const sessionId = sessionMatch[1];
    const session = await env.DB.prepare(
      'SELECT user_id FROM sessions WHERE session_id = ? AND expires_at > ?'
    ).bind(sessionId, Date.now()).first() as { user_id: string } | null;

    if (!session) {
      const response = Response.json({ error: 'Session expired' }, { status: 401 });
      return addSecurityHeaders(response);
    }

    // Verificar se o usuário é admin
    const user = await env.DB.prepare(
      'SELECT email FROM users WHERE id = ?'
    ).bind(session.user_id).first() as { email: string } | null;

    const adminEmails = ['profitshards@gmail.com', 'admin@profitshards.com', 'holdboy01@gmail.com'];
    const isAdmin = user && adminEmails.includes(user.email);

    if (!isAdmin) {
      const response = Response.json({ error: 'Admin access required' }, { status: 403 });
      return addSecurityHeaders(response);
    }

    // Buscar informações das tabelas
    const tables = await env.DB.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' ORDER BY name
    `).all();

    // Verificar se tabela map_drop_metrics existe
    const hasMapDropTable = tables.results.some((t: any) => t.name === 'map_drop_metrics');
    
    let mapDropData = null;
    let mapDropCount = 0;
    
    if (hasMapDropTable) {
      // Contar registros
      const countResult = await env.DB.prepare(`
        SELECT COUNT(*) as total FROM map_drop_metrics
      `).first() as { total: number } | null;
      
      mapDropCount = countResult?.total || 0;
      
      // Buscar últimos 10 registros se existirem
      if (mapDropCount > 0) {
        const recentData = await env.DB.prepare(`
          SELECT * FROM map_drop_metrics 
          ORDER BY created_at DESC 
          LIMIT 10
        `).all();
        
        mapDropData = recentData.results;
      }
    }

    // Verificar outras tabelas relacionadas
    const hasUsersTable = tables.results.some((t: any) => t.name === 'users');
    const hasSessionsTable = tables.results.some((t: any) => t.name === 'sessions');
    
    let userCount = 0;
    let sessionCount = 0;
    
    if (hasUsersTable) {
      const userCountResult = await env.DB.prepare(`SELECT COUNT(*) as total FROM users`).first() as { total: number } | null;
      userCount = userCountResult?.total || 0;
    }
    
    if (hasSessionsTable) {
      const sessionCountResult = await env.DB.prepare(`SELECT COUNT(*) as total FROM sessions WHERE expires_at > ?`).bind(Date.now()).first() as { total: number } | null;
      sessionCount = sessionCountResult?.total || 0;
    }

    const debugInfo = {
      timestamp: new Date().toISOString(),
      admin_user: user.email,
      database_info: {
        tables: tables.results.map((t: any) => t.name),
        total_tables: tables.results.length
      },
      map_drop_metrics: {
        table_exists: hasMapDropTable,
        total_records: mapDropCount,
        recent_data: mapDropData
      },
      other_tables: {
        users: { exists: hasUsersTable, count: userCount },
        sessions: { exists: hasSessionsTable, active_count: sessionCount }
      }
    };

    console.log('🔍 DEBUG DATA:', JSON.stringify(debugInfo, null, 2));
    
    const response = Response.json(debugInfo);
    return addSecurityHeaders(response);

  } catch (error) {
    console.error('Debug data error:', error);
    const response = Response.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
    return addSecurityHeaders(response);
  }
}