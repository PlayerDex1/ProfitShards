import { addSecurityHeaders, checkRateLimit, getClientIP } from "../../_lib/security";
import { getMapPlannerMetrics } from "../../_lib/metrics";

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

    // Buscar parâmetros da query
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') || '30');
    
    // Validar parâmetro days
    if (days < 1 || days > 365) {
      const response = Response.json({ error: 'Days parameter must be between 1 and 365' }, { status: 400 });
      return addSecurityHeaders(response);
    }

    // Buscar métricas do map planner
    const metrics = await getMapPlannerMetrics(env, days);
    
    if (!metrics) {
      const response = Response.json({ error: 'Failed to fetch metrics' }, { status: 500 });
      return addSecurityHeaders(response);
    }

    console.log(`📊 Admin metrics accessed by: ${user.email}`);
    
    const response = Response.json(metrics);
    return addSecurityHeaders(response);

  } catch (error) {
    console.error('Admin metrics error:', error);
    const response = Response.json({ error: 'Internal server error' }, { status: 500 });
    return addSecurityHeaders(response);
  }
}