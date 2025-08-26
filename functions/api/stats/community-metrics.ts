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

    // A. TOTAL DE RUNS (dados reais do feed + cálculos)
    const feedRunsQuery = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM feed_runs 
      WHERE created_at > ?
    `).bind(sevenDaysAgo).first();

    const calculationsQuery = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM user_calculations 
      WHERE created_at > ?
    `).bind(sevenDaysAgo).first();

    const totalRuns = (feedRunsQuery?.count || 0) + (calculationsQuery?.count || 0);

    // B. LUCRO TOTAL (baseado em feed_runs + cálculos)
    const feedProfitData = await env.DB.prepare(`
      SELECT SUM(tokens) as total_tokens FROM feed_runs 
      WHERE created_at > ?
    `).bind(sevenDaysAgo).first();

    // Para cálculos, não temos profit direto, então vamos usar apenas feed_runs
    const calculationProfitData = { total_profit: 0 };

    // Converter tokens do feed para "lucro" estimado (1 token = $100)
    const feedProfit = (feedProfitData?.total_tokens || 0) * 100;
    const calculationProfit = calculationProfitData?.total_profit || 0;
    
    const totalProfit = feedProfit + calculationProfit;

    // C. PLAYERS ATIVOS (únicos nas últimas 24h - feed + cálculos)
    const feedActivePlayersQuery = await env.DB.prepare(`
      SELECT COUNT(DISTINCT user_id) as count FROM feed_runs 
      WHERE created_at > ?
    `).bind(twentyFourHoursAgo).first();

    const calculationActivePlayersQuery = await env.DB.prepare(`
      SELECT COUNT(DISTINCT user_id) as count FROM user_calculations 
      WHERE created_at > ?
    `).bind(twentyFourHoursAgo).first();

    const activePlayers = (feedActivePlayersQuery?.count || 0) + (calculationActivePlayersQuery?.count || 0);

    // D. TAXA DE SUCESSO (baseada em feed_runs com tokens > 0)
    const feedSuccessQuery = await env.DB.prepare(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN tokens > 0 THEN 1 END) as successful
      FROM feed_runs 
      WHERE created_at > ?
    `).bind(sevenDaysAgo).first();

    // Para cálculos, vamos assumir sucesso sempre (já que não temos dados de profit)
    const calculationSuccessQuery = await env.DB.prepare(`
      SELECT COUNT(*) as total, COUNT(*) as successful
      FROM user_calculations 
      WHERE created_at > ?
    `).bind(sevenDaysAgo).first();

    const totalSuccessCount = (feedSuccessQuery?.total || 0) + (calculationSuccessQuery?.total || 0);
    const totalSuccessful = (feedSuccessQuery?.successful || 0) + (calculationSuccessQuery?.successful || 0);

    const successRate = totalSuccessCount > 0 
      ? Math.round((totalSuccessful / totalSuccessCount) * 100)
      : 0;

    // E. TOP MAPAS (baseado em feed_runs)
    const topMapsQuery = await env.DB.prepare(`
      SELECT 
        map_name as map,
        COUNT(*) as count,
        AVG(tokens) as avg_tokens
      FROM feed_runs 
      WHERE created_at > ?
      GROUP BY map_name 
      ORDER BY count DESC 
      LIMIT 5
    `).bind(sevenDaysAgo).all();

    const topMaps = (topMapsQuery.results || []).map(row => ({
      map: row.map as string,
      count: row.count as number,
      avgTokens: Math.round((row.avg_tokens as number) || 0)
    }));

    // F. EFICIÊNCIA MÉDIA (baseada em tokens/carga do feed)
    const feedEfficiencyQuery = await env.DB.prepare(`
      SELECT AVG(CAST(tokens AS FLOAT) / CAST(charge AS FLOAT)) as avg_efficiency 
      FROM feed_runs 
      WHERE created_at > ? AND charge > 0
    `).bind(sevenDaysAgo).first();

    // Para cálculos, não temos dados de efficiency na coluna, usar 0
    const calculationEfficiencyQuery = { avg_efficiency: 0 };

    const feedEfficiency = feedEfficiencyQuery?.avg_efficiency || 0;
    const calculationEfficiency = calculationEfficiencyQuery?.avg_efficiency || 0;
    
    // Média ponderada ou usar a que tiver dados
    const avgEfficiency = feedEfficiency > 0 ? Math.round(feedEfficiency * 10) : Math.round(calculationEfficiency);

    // G. TOTAL DE CÁLCULOS (apenas calculations, não feed_runs)
    const totalCalculationsQuery = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM user_calculations 
      WHERE created_at > ?
    `).bind(sevenDaysAgo).first();

    const totalCalculations = totalCalculationsQuery?.count || 0;

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