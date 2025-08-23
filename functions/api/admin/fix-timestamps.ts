import { addSecurityHeaders, checkRateLimit, getClientIP } from "../../_lib/security";

export interface Env {
  DB: D1Database;
  KV?: KVNamespace;
}

export async function onRequestPost({ env, request }: { env: Env; request: Request }) {
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

    // Verificar registros com timestamps inválidos
    const now = Date.now();
    const futureThreshold = now + (365 * 24 * 60 * 60 * 1000); // 1 ano no futuro
    
    const invalidRecords = await env.DB.prepare(`
      SELECT id, created_at, session_date 
      FROM map_drop_metrics 
      WHERE created_at > ?
    `).bind(futureThreshold).all();

    console.log('🔍 Registros com timestamp inválido:', invalidRecords.results.length);

    if (invalidRecords.results.length > 0) {
      // Corrigir timestamps baseado na session_date
      let fixed = 0;
      
      for (const record of invalidRecords.results) {
        const sessionDate = record.session_date as string; // YYYY-MM-DD
        const correctTimestamp = new Date(sessionDate + 'T12:00:00Z').getTime();
        
        await env.DB.prepare(`
          UPDATE map_drop_metrics 
          SET created_at = ? 
          WHERE id = ?
        `).bind(correctTimestamp, record.id).run();
        
        fixed++;
      }
      
      console.log(`✅ Corrigidos ${fixed} registros com timestamp inválido`);
    }

    // Verificar se ainda há registros com problemas
    const remainingInvalid = await env.DB.prepare(`
      SELECT COUNT(*) as count 
      FROM map_drop_metrics 
      WHERE created_at > ?
    `).bind(futureThreshold).first();

    // Buscar estatísticas atualizadas
    const stats = await env.DB.prepare(`
      SELECT 
        COUNT(*) as total,
        MIN(created_at) as oldest,
        MAX(created_at) as newest
      FROM map_drop_metrics
    `).first();

    const result = {
      timestamp: new Date().toISOString(),
      admin_user: user.email,
      action: 'fix_timestamps',
      invalid_records_found: invalidRecords.results.length,
      records_fixed: invalidRecords.results.length,
      remaining_invalid: remainingInvalid?.count || 0,
      current_stats: {
        total_records: stats?.total || 0,
        oldest_timestamp: stats?.oldest,
        newest_timestamp: stats?.newest,
        oldest_date: stats?.oldest ? new Date(stats.oldest).toISOString() : null,
        newest_date: stats?.newest ? new Date(stats.newest).toISOString() : null
      }
    };

    console.log('🔧 Fix timestamps result:', result);
    
    const response = Response.json(result);
    return addSecurityHeaders(response);

  } catch (error) {
    console.error('Fix timestamps error:', error);
    const response = Response.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
    return addSecurityHeaders(response);
  }
}