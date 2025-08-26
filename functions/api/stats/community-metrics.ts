interface Env {
  DB: D1Database;
  KV?: KVNamespace;
}

interface CommunityStats {
  totalRuns: number;
  totalProfit: number;
  activePlayers: number;
  successRate: number;
  topMaps: Array<{
    map: string;
    count: number;
    avgTokens: number;
  }>;
  avgEfficiency: number;
  totalCalculations: number;
  lastUpdated: string;
}

const CACHE_KEY = 'community_stats_cache';
const CACHE_TTL = 10 * 60; // 10 minutos - mais longo pois são dados agregados

export async function onRequestGet({ env }: { env: Env }) {
  try {
    console.log('📊 COMMUNITY STATS: Coletando métricas da comunidade...');

    // 1. TENTAR CACHE PRIMEIRO
    if (env.KV) {
      try {
        const cached = await env.KV.get(CACHE_KEY, 'json');
        if (cached) {
          console.log('📦 Stats em cache - retornando');
          return new Response(JSON.stringify({
            success: true,
            stats: cached,
            cached: true,
            timestamp: new Date().toISOString()
          }), {
            status: 200,
            headers: { 
              'Content-Type': 'application/json',
              'Cache-Control': 'public, max-age=600', // 10 min browser cache
              'Access-Control-Allow-Origin': '*'
            }
          });
        }
      } catch (cacheError) {
        console.log('⚠️ Cache error (continuando):', cacheError);
      }
    }

    // 2. COLETAR ESTATÍSTICAS REAIS DO BANCO
    console.log('🔍 Coletando dados do banco...');

    // Últimas 24 horas
    const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

    // A. TOTAL DE CÁLCULOS (apenas dados reais dos usuários)
    const totalRunsQuery = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM user_calculations 
      WHERE created_at > ?
    `).bind(sevenDaysAgo).first();

    const totalRuns = totalRunsQuery?.count || 0;

    // B. LUCRO TOTAL (baseado em cálculos reais dos usuários)
    const profitData = await env.DB.prepare(`
      SELECT SUM(final_profit) as total_profit FROM user_calculations 
      WHERE created_at > ?
    `).bind(sevenDaysAgo).first();

    const totalProfit = profitData?.total_profit || 0;

    // C. PLAYERS ATIVOS (únicos nas últimas 24h)
    const activePlayersQuery = await env.DB.prepare(`
      SELECT COUNT(DISTINCT user_id) as count FROM user_calculations 
      WHERE created_at > ?
    `).bind(twentyFourHoursAgo).first();

    const activePlayers = activePlayersQuery?.count || 0;

    // D. TAXA DE SUCESSO (baseada em ROI > 0)
    const successQuery = await env.DB.prepare(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN final_profit > 0 THEN 1 END) as successful
      FROM user_calculations 
      WHERE created_at > ?
    `).bind(sevenDaysAgo).first();

    const successRate = successQuery?.total > 0 
      ? Math.round((successQuery.successful / successQuery.total) * 100)
      : 0; // começar com 0 para dados reais

    // E. TOP ESTRATÉGIAS (baseado em ROI médio)
    const topStrategiesQuery = await env.DB.prepare(`
      SELECT 
        AVG(roi) as avg_roi,
        COUNT(*) as count,
        AVG(efficiency) as avg_efficiency
      FROM user_calculations 
      WHERE created_at > ? AND roi > 0
      GROUP BY ROUND(investment / 1000) * 1000
      ORDER BY avg_roi DESC 
      LIMIT 5
    `).bind(sevenDaysAgo).all();

    const topMaps = (topStrategiesQuery.results || []).map((row, index) => ({
      map: `Strategy ${index + 1}`,
      count: row.count as number,
      avgTokens: Math.round((row.avg_roi as number) || 0)
    }));

    // F. EFICIÊNCIA MÉDIA
    const efficiencyQuery = await env.DB.prepare(`
      SELECT AVG(efficiency) as avg_efficiency 
      FROM user_calculations 
      WHERE created_at > ?
    `).bind(sevenDaysAgo).first();

    const avgEfficiency = Math.round((efficiencyQuery?.avg_efficiency || 0) * 100);

    // G. TOTAL DE CÁLCULOS
    const calculationsQuery = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM user_calculations 
      WHERE created_at > ?
    `).bind(sevenDaysAgo).first();

    const totalCalculations = calculationsQuery?.count || 0;

    // 3. MONTAR RESPOSTA
    const stats: CommunityStats = {
      totalRuns,
      totalProfit,
      activePlayers,
      successRate,
      topMaps,
      avgEfficiency,
      totalCalculations,
      lastUpdated: new Date().toISOString()
    };

    console.log('📊 Stats coletadas:', {
      totalRuns,
      totalProfit: `$${(totalProfit / 1000000).toFixed(1)}M`,
      activePlayers,
      successRate: `${successRate}%`
    });

    // 4. SALVAR NO CACHE
    if (env.KV) {
      try {
        await env.KV.put(CACHE_KEY, JSON.stringify(stats), { expirationTtl: CACHE_TTL });
        console.log('💾 Stats salvas no cache por', CACHE_TTL / 60, 'minutos');
      } catch (cacheError) {
        console.log('⚠️ Erro ao salvar cache:', cacheError);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      stats,
      cached: false,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=600',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('❌ Erro ao coletar community stats:', error);
    
    // FALLBACK: Retorna stats zeradas para começar do zero
    const emptyStats: CommunityStats = {
      totalRuns: 0,
      totalProfit: 0,
      activePlayers: 0,
      successRate: 0,
      topMaps: [],
      avgEfficiency: 0,
      totalCalculations: 0,
      lastUpdated: new Date().toISOString()
    };

    return new Response(JSON.stringify({
      success: true,
      stats: emptyStats,
      fallback: true,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}