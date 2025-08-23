import { addSecurityHeaders, checkRateLimit, getClientIP } from "../../_lib/security";
import { createUserHash } from "../../_lib/metrics";

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

    // Parse do body para obter email a verificar
    const body = await request.json();
    const { email } = body;

    if (!email) {
      const response = Response.json({ error: 'Email is required' }, { status: 400 });
      return addSecurityHeaders(response);
    }

    // Buscar o usuário pelo email
    const targetUser = await env.DB.prepare(
      'SELECT id, email, created_at FROM users WHERE email = ?'
    ).bind(email).first() as { id: string; email: string; created_at: number } | null;

    if (!targetUser) {
      const response = Response.json({
        found: false,
        message: `Usuário com email ${email} não encontrado na tabela users`
      });
      return addSecurityHeaders(response);
    }

    // Gerar hash do usuário
    const userHash = createUserHash(targetUser.id);

    // Buscar métricas do usuário
    const userMetrics = await env.DB.prepare(`
      SELECT * FROM map_drop_metrics 
      WHERE user_hash = ? 
      ORDER BY created_at DESC
    `).bind(userHash).all();

    // Buscar sessões ativas do usuário
    const userSessions = await env.DB.prepare(`
      SELECT session_id, created_at, expires_at 
      FROM sessions 
      WHERE user_id = ? AND expires_at > ?
      ORDER BY created_at DESC
    `).bind(targetUser.id, Date.now()).all();

    const result = {
      timestamp: new Date().toISOString(),
      admin_user: user.email,
      target_user: {
        id: targetUser.id,
        email: targetUser.email,
        created_at: targetUser.created_at,
        created_date: new Date(targetUser.created_at).toISOString(),
        user_hash: userHash
      },
      metrics: {
        total_records: userMetrics.results.length,
        records: userMetrics.results
      },
      sessions: {
        active_sessions: userSessions.results.length,
        sessions: userSessions.results
      }
    };

    console.log('🔍 User check result:', JSON.stringify(result, null, 2));
    
    const response = Response.json(result);
    return addSecurityHeaders(response);

  } catch (error) {
    console.error('Check user error:', error);
    const response = Response.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
    return addSecurityHeaders(response);
  }
}