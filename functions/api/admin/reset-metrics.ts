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

    // Contar registros antes da limpeza
    const beforeCount = await env.DB.prepare(`
      SELECT COUNT(*) as total FROM map_drop_metrics
    `).first() as { total: number } | null;

    // Limpar todos os dados da tabela de métricas
    await env.DB.prepare(`DELETE FROM map_drop_metrics`).run();

    // Verificar se limpeza foi bem sucedida
    const afterCount = await env.DB.prepare(`
      SELECT COUNT(*) as total FROM map_drop_metrics
    `).first() as { total: number } | null;

    const result = {
      timestamp: new Date().toISOString(),
      admin_user: user.email,
      action: 'reset_metrics',
      records_before: beforeCount?.total || 0,
      records_after: afterCount?.total || 0,
      success: (afterCount?.total || 0) === 0,
      message: 'Tabela de métricas resetada. Agora faça novos testes com timestamps corretos.'
    };

    console.log('🗑️ Reset metrics result:', result);
    
    const response = Response.json(result);
    return addSecurityHeaders(response);

  } catch (error) {
    console.error('Reset metrics error:', error);
    const response = Response.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
    return addSecurityHeaders(response);
  }
}