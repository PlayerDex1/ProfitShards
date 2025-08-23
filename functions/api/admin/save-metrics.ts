import { addSecurityHeaders, checkRateLimit, getClientIP, validateCalculationData } from "../../_lib/security";
import { saveFarmingMetrics, saveMapDropMetrics } from "../../_lib/metrics";

export interface Env {
  DB: D1Database;
  KV?: KVNamespace;
}

export async function onRequestPost({ env, request }: { env: Env; request: Request }) {
  console.log('🔍 DEBUG: save-metrics endpoint chamado');
  
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResult = await checkRateLimit(env, clientIP, 'api', request);
    
    if (!rateLimitResult.allowed) {
      console.log('❌ Rate limit atingido para IP:', clientIP);
      const response = Response.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
      return addSecurityHeaders(response);
    }

    // Verificar autenticação
    const cookie = request.headers.get('Cookie');
    console.log('🔍 Cookie recebido:', cookie ? 'SIM' : 'NÃO');
    
    if (!cookie) {
      console.log('❌ Cookie não encontrado');
      const response = Response.json({ error: 'Authentication required' }, { status: 401 });
      return addSecurityHeaders(response);
    }

    const sessionMatch = cookie.match(/ps_session=([^;]+)/);
    if (!sessionMatch) {
      console.log('❌ Sessão não encontrada no cookie');
      const response = Response.json({ error: 'Invalid session' }, { status: 401 });
      return addSecurityHeaders(response);
    }

    // Verificar se a sessão é válida
    const sessionId = sessionMatch[1];
    console.log('🔍 Verificando sessão:', sessionId.substring(0, 8) + '...');
    
    const session = await env.DB.prepare(
      'SELECT user_id FROM sessions WHERE session_id = ? AND expires_at > ?'
    ).bind(sessionId, Date.now()).first() as { user_id: string } | null;

    if (!session) {
      console.log('❌ Sessão expirada ou inválida');
      const response = Response.json({ error: 'Session expired' }, { status: 401 });
      return addSecurityHeaders(response);
    }

    console.log('✅ Usuário autenticado:', session.user_id);

    // Parse do body
    const body = await request.json();
    const { type, data, results } = body;
    
    console.log('🔍 Dados recebidos:', { type, data, results });

    // Validar dados
    if (!type || !data) {
      console.log('❌ Dados inválidos - type ou data ausente');
      const response = Response.json({ error: 'Invalid request data' }, { status: 400 });
      return addSecurityHeaders(response);
    }

    // Salvar métricas baseado no tipo
    if (type === 'calculation' && results) {
      console.log('📊 Salvando métricas de cálculo...');
      if (!validateCalculationData(data)) {
        console.log('❌ Dados de cálculo inválidos');
        const response = Response.json({ error: 'Invalid calculation data' }, { status: 400 });
        return addSecurityHeaders(response);
      }
      
      await saveFarmingMetrics(env, session.user_id, data, results);
    } else if (type === 'map_drop') {
      console.log('🗺️ Salvando métricas de map drop...');
      await saveMapDropMetrics(env, session.user_id, data);
    } else {
      console.log('❌ Tipo de métrica desconhecido:', type);
    }

    console.log(`✅ Metrics saved for user: ${session.user_id} (type: ${type})`);
    
    const response = Response.json({ 
      success: true, 
      message: `Métrica ${type} salva com sucesso`,
      userId: session.user_id,
      timestamp: new Date().toISOString()
    });
    return addSecurityHeaders(response);

  } catch (error) {
    console.error('❌ Save metrics error:', error);
    console.error('❌ Error stack:', error.stack);
    const response = Response.json({ 
      error: 'Internal server error',
      message: error.message,
      stack: error.stack 
    }, { status: 500 });
    return addSecurityHeaders(response);
  }
}