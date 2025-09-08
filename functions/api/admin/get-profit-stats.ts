import { addSecurityHeaders } from '../../_lib/security';

interface Env {
  DB: D1Database;
}

export async function onRequestGet({ env, request }: { env: Env; request: Request }) {
  try {
    console.log('💰 GET PROFIT STATS: Buscando estatísticas de lucros');

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

    // Verificar se a tabela existe
    const tableExists = await env.DB.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='profit_calculations'
    `).first();

    if (!tableExists) {
      console.log('📊 Tabela profit_calculations não existe ainda');
      const response = Response.json({
        success: true,
        stats: {
          totalCalculations: 0,
          totalProfit: 0,
          avgProfit: 0,
          avgEfficiency: 0,
          topLevel: 'N/A',
          topTier: 'N/A',
          topMapSize: 'N/A',
          avgTokenPrice: 0,
          avgTokensFarmed: 0,
          levelStats: [],
          tierStats: [],
          mapSizeStats: [],
          efficiencyRanges: [],
          profitRanges: [],
          recentActivity: []
        },
        message: 'Nenhum dado de lucro disponível ainda'
      });
      return addSecurityHeaders(response);
    }

    // Buscar estatísticas gerais
    const generalStats = await env.DB.prepare(`
      SELECT 
        COUNT(*) as total_calculations,
        SUM(total_profit) as total_profit,
        AVG(total_profit) as avg_profit,
        AVG(efficiency) as avg_efficiency,
        AVG(token_price) as avg_token_price,
        AVG(tokens_farmed) as avg_tokens_farmed
      FROM profit_calculations
      WHERE created_at > ?
    `).bind(Date.now() - (30 * 24 * 60 * 60 * 1000)).first();

    // Buscar level mais popular
    const topLevel = await env.DB.prepare(`
      SELECT level, COUNT(*) as count
      FROM profit_calculations
      WHERE created_at > ?
      GROUP BY level
      ORDER BY count DESC
      LIMIT 1
    `).bind(Date.now() - (30 * 24 * 60 * 60 * 1000)).first();

    // Buscar tier mais popular
    const topTier = await env.DB.prepare(`
      SELECT tier, COUNT(*) as count
      FROM profit_calculations
      WHERE created_at > ?
      GROUP BY tier
      ORDER BY count DESC
      LIMIT 1
    `).bind(Date.now() - (30 * 24 * 60 * 60 * 1000)).first();

    // Buscar map size mais popular
    const topMapSize = await env.DB.prepare(`
      SELECT map_size, COUNT(*) as count
      FROM profit_calculations
      WHERE created_at > ?
      GROUP BY map_size
      ORDER BY count DESC
      LIMIT 1
    `).bind(Date.now() - (30 * 24 * 60 * 60 * 1000)).first();

    // Estatísticas por level
    const levelStats = await env.DB.prepare(`
      SELECT 
        level,
        COUNT(*) as count,
        AVG(total_profit) as avg_profit,
        AVG(efficiency) as avg_efficiency,
        SUM(total_profit) as total_profit
      FROM profit_calculations
      WHERE created_at > ?
      GROUP BY level
      ORDER BY count DESC
      LIMIT 10
    `).bind(Date.now() - (30 * 24 * 60 * 60 * 1000)).all();

    // Estatísticas por tier
    const tierStats = await env.DB.prepare(`
      SELECT 
        tier,
        COUNT(*) as count,
        AVG(total_profit) as avg_profit,
        AVG(efficiency) as avg_efficiency,
        SUM(total_profit) as total_profit
      FROM profit_calculations
      WHERE created_at > ?
      GROUP BY tier
      ORDER BY count DESC
      LIMIT 10
    `).bind(Date.now() - (30 * 24 * 60 * 60 * 1000)).all();

    // Estatísticas por map size
    const mapSizeStats = await env.DB.prepare(`
      SELECT 
        map_size,
        COUNT(*) as count,
        AVG(total_profit) as avg_profit,
        AVG(efficiency) as avg_efficiency,
        SUM(total_profit) as total_profit
      FROM profit_calculations
      WHERE created_at > ?
      GROUP BY map_size
      ORDER BY count DESC
      LIMIT 10
    `).bind(Date.now() - (30 * 24 * 60 * 60 * 1000)).all();

    // Faixas de eficiência
    const efficiencyRanges = await env.DB.prepare(`
      SELECT 
        CASE 
          WHEN efficiency < 50 THEN '0-50%'
          WHEN efficiency < 70 THEN '50-70%'
          WHEN efficiency < 85 THEN '70-85%'
          WHEN efficiency < 95 THEN '85-95%'
          ELSE '95-100%'
        END as range,
        COUNT(*) as count,
        AVG(total_profit) as avg_profit
      FROM profit_calculations
      WHERE created_at > ?
      GROUP BY range
      ORDER BY count DESC
    `).bind(Date.now() - (30 * 24 * 60 * 60 * 1000)).all();

    // Faixas de lucro
    const profitRanges = await env.DB.prepare(`
      SELECT 
        CASE 
          WHEN total_profit < 1000 THEN '0-1K'
          WHEN total_profit < 5000 THEN '1K-5K'
          WHEN total_profit < 10000 THEN '5K-10K'
          WHEN total_profit < 25000 THEN '10K-25K'
          ELSE '25K+'
        END as range,
        COUNT(*) as count,
        AVG(efficiency) as avg_efficiency
      FROM profit_calculations
      WHERE created_at > ?
      GROUP BY range
      ORDER BY count DESC
    `).bind(Date.now() - (30 * 24 * 60 * 60 * 1000)).all();

    // Atividade recente (últimos 7 dias)
    const recentActivity = await env.DB.prepare(`
      SELECT 
        DATE(created_at / 1000, 'unixepoch') as date,
        COUNT(*) as calculations,
        AVG(total_profit) as avg_profit,
        SUM(total_profit) as total_profit
      FROM profit_calculations
      WHERE created_at > ?
      GROUP BY DATE(created_at / 1000, 'unixepoch')
      ORDER BY date DESC
      LIMIT 7
    `).bind(Date.now() - (7 * 24 * 60 * 60 * 1000)).all();

    console.log(`📊 Estatísticas de lucro carregadas: ${generalStats?.total_calculations || 0} cálculos`);

    const response = Response.json({
      success: true,
      stats: {
        totalCalculations: generalStats?.total_calculations || 0,
        totalProfit: generalStats?.total_profit || 0,
        avgProfit: Math.round((generalStats?.avg_profit || 0) * 100) / 100,
        avgEfficiency: Math.round((generalStats?.avg_efficiency || 0) * 100) / 100,
        topLevel: topLevel?.level || 'N/A',
        topTier: topTier?.tier || 'N/A',
        topMapSize: topMapSize?.map_size || 'N/A',
        avgTokenPrice: Math.round((generalStats?.avg_token_price || 0) * 100) / 100,
        avgTokensFarmed: Math.round((generalStats?.avg_tokens_farmed || 0) * 100) / 100,
        levelStats: (levelStats.results || []).map((l: any) => ({
          level: l.level,
          count: l.count,
          avgProfit: Math.round(l.avg_profit * 100) / 100,
          avgEfficiency: Math.round(l.avg_efficiency * 100) / 100,
          totalProfit: l.total_profit
        })),
        tierStats: (tierStats.results || []).map((t: any) => ({
          tier: t.tier,
          count: t.count,
          avgProfit: Math.round(t.avg_profit * 100) / 100,
          avgEfficiency: Math.round(t.avg_efficiency * 100) / 100,
          totalProfit: t.total_profit
        })),
        mapSizeStats: (mapSizeStats.results || []).map((m: any) => ({
          mapSize: m.map_size,
          count: m.count,
          avgProfit: Math.round(m.avg_profit * 100) / 100,
          avgEfficiency: Math.round(m.avg_efficiency * 100) / 100,
          totalProfit: m.total_profit
        })),
        efficiencyRanges: (efficiencyRanges.results || []).map((e: any) => ({
          range: e.range,
          count: e.count,
          avgProfit: Math.round(e.avg_profit * 100) / 100
        })),
        profitRanges: (profitRanges.results || []).map((p: any) => ({
          range: p.range,
          count: p.count,
          avgEfficiency: Math.round(p.avg_efficiency * 100) / 100
        })),
        recentActivity: (recentActivity.results || []).map((r: any) => ({
          date: r.date,
          calculations: r.calculations,
          avgProfit: Math.round(r.avg_profit * 100) / 100,
          totalProfit: r.total_profit
        }))
      }
    });
    
    return addSecurityHeaders(response);

  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas de lucro:', error);
    const response = Response.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 });
    return addSecurityHeaders(response);
  }
}