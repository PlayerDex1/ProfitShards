import { addSecurityHeaders } from '../../_lib/security';

interface Env {
  DB: D1Database;
}

export async function onRequestGet({ env, request }: { env: Env; request: Request }) {
  try {
    console.log('📈 GET TRENDS: Buscando dados reais de tendências');

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

    // Buscar dados de tendências dos últimos 30 dias
    const trendsQuery = await env.DB.prepare(`
      SELECT 
        DATE(fr.created_at / 1000, 'unixepoch') as date,
        COUNT(*) as runs,
        COUNT(DISTINCT fr.user_email) as users,
        SUM(fr.tokens) as profit
      FROM feed_runs fr
      WHERE fr.created_at > ?
      GROUP BY DATE(fr.created_at / 1000, 'unixepoch')
      ORDER BY date DESC
      LIMIT 30
    `).bind(Date.now() - (30 * 24 * 60 * 60 * 1000)).all();

    console.log(`📊 Encontrados ${trendsQuery.results?.length || 0} dias com dados`);

    // Processar dados de tendências
    const trends = (trendsQuery.results || []).map((trend: any) => ({
      date: trend.date,
      runs: trend.runs || 0,
      users: trend.users || 0,
      profit: trend.profit || 0
    }));

    // Se não houver dados reais, retornar array vazio
    if (trends.length === 0) {
      console.log('📊 Nenhum dado de tendência encontrado');
      const response = Response.json({
        success: true,
        trends: [],
        total: 0,
        message: 'Nenhum dado de tendência disponível'
      });
      return addSecurityHeaders(response);
    }

    console.log(`✅ Retornando ${trends.length} dias de tendências`);

    const response = Response.json({
      success: true,
      trends: trends,
      total: trends.length,
      totalRuns: trends.reduce((sum, t) => sum + t.runs, 0),
      totalUsers: Math.max(...trends.map(t => t.users)),
      totalProfit: trends.reduce((sum, t) => sum + t.profit, 0)
    });
    
    return addSecurityHeaders(response);

  } catch (error) {
    console.error('❌ Erro ao buscar tendências:', error);
    const response = Response.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 });
    return addSecurityHeaders(response);
  }
}