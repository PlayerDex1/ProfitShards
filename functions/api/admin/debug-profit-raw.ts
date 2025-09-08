import { addSecurityHeaders } from '../../_lib/security';

interface Env {
  DB: D1Database;
}

export async function onRequestGet({ env, request }: { env: Env; request: Request }) {
  try {
    console.log('🔍 DEBUG RAW PROFIT: Buscando dados brutos');

    // Verificar se DB existe
    if (!env.DB) {
      const response = Response.json({ 
        error: 'Database not available' 
      }, { status: 500 });
      return addSecurityHeaders(response);
    }

    // Verificar autenticação
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) {
      const response = Response.json({ error: 'Unauthorized' }, { status: 401 });
      return addSecurityHeaders(response);
    }

    const sessionCookie = cookieHeader
      .split(';')
      .find(c => c.trim().startsWith('ps_session='))
      ?.split('=')[1];

    if (!sessionCookie) {
      const response = Response.json({ error: 'No session' }, { status: 401 });
      return addSecurityHeaders(response);
    }

    // Buscar usuário pela sessão
    const session = await env.DB.prepare(`
      SELECT u.id, u.email 
      FROM sessions s 
      JOIN users u ON s.user_id = u.id 
      WHERE s.session_id = ? AND s.expires_at > ?
    `).bind(sessionCookie, Date.now()).first() as { id: string; email: string } | null;

    if (!session) {
      const response = Response.json({ error: 'Invalid session' }, { status: 401 });
      return addSecurityHeaders(response);
    }

    // Buscar dados brutos da tabela user_calculations
    const rawData = await env.DB.prepare(`
      SELECT 
        uc.id,
        uc.calculation_type,
        uc.calculation_data,
        uc.result_data,
        uc.created_at,
        u.email
      FROM user_calculations uc
      JOIN users u ON uc.user_id = u.id
      WHERE uc.calculation_type = 'profit' 
        AND uc.created_at > ?
      ORDER BY uc.created_at DESC
      LIMIT 5
    `).bind(Date.now() - (30 * 24 * 60 * 60 * 1000)).all();

    // Processar dados para debug
    const debugData = (rawData.results || []).map((calc: any) => {
      try {
        const data = JSON.parse(calc.calculation_data);
        const results = JSON.parse(calc.result_data);
        
        return {
          id: calc.id,
          email: calc.email,
          created_at: calc.created_at,
          calculation_data: data,
          result_data: results,
          total_profit: results.totalProfit,
          efficiency: results.efficiency,
          token_price: data.tokenPrice,
          tokens_farmed: data.tokensFarmed
        };
      } catch (error) {
        return {
          id: calc.id,
          email: calc.email,
          created_at: calc.created_at,
          error: 'Failed to parse JSON',
          raw_calculation_data: calc.calculation_data,
          raw_result_data: calc.result_data
        };
      }
    });

    const response = Response.json({
      success: true,
      total_found: rawData.results?.length || 0,
      debug_data: debugData,
      message: 'Dados brutos para debug'
    });
    
    return addSecurityHeaders(response);

  } catch (error) {
    console.error('❌ Erro ao buscar dados brutos:', error);
    const response = Response.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 });
    return addSecurityHeaders(response);
  }
}