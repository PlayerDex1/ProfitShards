import { addSecurityHeaders, checkRateLimit, getClientIP, validateCalculationData } from "../../_lib/security";
import { saveFarmingMetrics, saveMapDropMetrics } from "../../_lib/metrics";

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

    // Parse do body
    const body = await request.json();
    const { type, data, results } = body;

    // Validar dados
    if (!type || !data) {
      const response = Response.json({ error: 'Invalid request data' }, { status: 400 });
      return addSecurityHeaders(response);
    }

    // Salvar métricas baseado no tipo
    if (type === 'calculation' && results) {
      if (!validateCalculationData(data)) {
        const response = Response.json({ error: 'Invalid calculation data' }, { status: 400 });
        return addSecurityHeaders(response);
      }
      
      await saveFarmingMetrics(env, session.user_id, data, results);
    } else if (type === 'map_drop') {
      await saveMapDropMetrics(env, session.user_id, data);
    }

    console.log(`📊 Metrics saved for user: ${session.user_id} (type: ${type})`);
    
    const response = Response.json({ success: true });
    return addSecurityHeaders(response);

  } catch (error) {
    console.error('Save metrics error:', error);
    const response = Response.json({ error: 'Internal server error' }, { status: 500 });
    return addSecurityHeaders(response);
  }
}