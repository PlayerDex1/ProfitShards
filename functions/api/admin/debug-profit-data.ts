import { addSecurityHeaders } from '../../_lib/security';

interface Env {
  DB: D1Database;
}

export async function onRequestGet({ env, request }: { env: Env; request: Request }) {
  try {
    console.log('🔍 DEBUG PROFIT DATA: Verificando dados de lucros');

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

    console.log('✅ Usuário autenticado:', session.email);

    // Verificar se a tabela user_calculations existe
    const tableExists = await env.DB.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='user_calculations'
    `).first();

    if (!tableExists) {
      const response = Response.json({
        success: true,
        debug: {
          tableExists: false,
          message: 'Tabela user_calculations não existe'
        }
      });
      return addSecurityHeaders(response);
    }

    // Contar total de cálculos
    const totalCalculations = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM user_calculations
    `).first();

    // Contar cálculos de lucro
    const profitCalculations = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM user_calculations 
      WHERE calculation_type = 'profit'
    `).first();

    // Buscar alguns exemplos de cálculos de lucro
    const sampleCalculations = await env.DB.prepare(`
      SELECT 
        uc.calculation_data,
        uc.result_data,
        uc.created_at,
        u.email
      FROM user_calculations uc
      JOIN users u ON uc.user_id = u.id
      WHERE uc.calculation_type = 'profit'
      ORDER BY uc.created_at DESC
      LIMIT 5
    `).all();

    // Buscar todos os tipos de cálculos
    const calculationTypes = await env.DB.prepare(`
      SELECT calculation_type, COUNT(*) as count
      FROM user_calculations
      GROUP BY calculation_type
    `).all();

    console.log(`📊 Debug: ${totalCalculations?.count || 0} cálculos totais, ${profitCalculations?.count || 0} de lucro`);

    const response = Response.json({
      success: true,
      debug: {
        tableExists: true,
        totalCalculations: totalCalculations?.count || 0,
        profitCalculations: profitCalculations?.count || 0,
        calculationTypes: calculationTypes.results || [],
        sampleCalculations: (sampleCalculations.results || []).map((calc: any) => ({
          email: calc.email,
          created_at: new Date(calc.created_at).toISOString(),
          calculation_data: JSON.parse(calc.calculation_data),
          result_data: JSON.parse(calc.result_data)
        }))
      }
    });
    
    return addSecurityHeaders(response);

  } catch (error) {
    console.error('❌ Erro no debug:', error);
    const response = Response.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 });
    return addSecurityHeaders(response);
  }
}