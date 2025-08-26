interface Env {
  DB: D1Database;
  KV?: KVNamespace;
}

interface MapAnalytics {
  mapSizeStats: {
    mapSize: string;
    totalRuns: number;
    avgTokens: number;
    avgEfficiency: number;
    topLevel: string;
    topTier: string;
    avgCharge: number;
  }[];
  levelTierStats: {
    level: string;
    tier: string;
    runs: number;
    avgTokens: number;
    avgEfficiency: number;
    popularMapSize: string;
  }[];
  chargeEfficiency: {
    chargeRange: string;
    runs: number;
    avgTokens: number;
    avgEfficiency: number;
  }[];
  hourlyActivity: {
    hour: number;
    runs: number;
    avgTokens: number;
    popularLevel: string;
  }[];
  userBehaviorPatterns: {
    totalUniqueUsers: number;
    avgRunsPerUser: number;
    casualUsers: number; // < 5 runs
    regularUsers: number; // 5-20 runs  
    powerUsers: number; // > 20 runs
  };
  recentActivity: {
    last24h: number;
    last7d: number;
    last30d: number;
    growthRate: number;
  };
}

const CACHE_KEY = 'map_analytics_cache';
const CACHE_TTL = 10 * 60; // 10 minutos

export async function onRequestGet({ env }: { env: Env }) {
  try {
    console.log('🗺️ MAP ANALYTICS: Coletando analytics avançados de mapas...');

    // Verificar cache primeiro
    if (env.KV) {
      try {
        const cached = await env.KV.get(CACHE_KEY, 'json');
        if (cached) {
          console.log('📦 Map analytics em cache');
          return new Response(JSON.stringify({
            success: true,
            data: cached,
            cached: true,
            timestamp: new Date().toISOString()
          }), {
            status: 200,
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }
      } catch (cacheError) {
        console.log('⚠️ Cache error:', cacheError);
      }
    }

    // Coletar dados das últimas 4 semanas para análise robusta
    const fourWeeksAgo = Date.now() - (4 * 7 * 24 * 60 * 60 * 1000);
    const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

    // 1. ESTATÍSTICAS POR TAMANHO DE MAPA
    const mapSizeQuery = await env.DB.prepare(`
      SELECT 
        map_name as mapSize,
        COUNT(*) as totalRuns,
        AVG(tokens) as avgTokens,
        AVG(CASE WHEN efficiency > 0 THEN efficiency ELSE NULL END) as avgEfficiency,
        AVG(charge) as avgCharge
      FROM feed_runs 
      WHERE created_at > ? 
      GROUP BY map_name
      ORDER BY totalRuns DESC
    `).bind(fourWeeksAgo).all();

    // Buscar level e tier mais comuns para cada mapa separadamente
    const mapLevelTierQuery = await env.DB.prepare(`
      SELECT 
        map_name,
        level,
        tier,
        COUNT(*) as frequency
      FROM feed_runs 
      WHERE created_at > ? AND level IS NOT NULL AND tier IS NOT NULL
      GROUP BY map_name, level, tier
      ORDER BY map_name, frequency DESC
    `).bind(fourWeeksAgo).all();

    // Criar mapa de level/tier mais comuns por mapa
    const mapLevelTierMap = new Map();
    (mapLevelTierQuery.results || []).forEach((row: any) => {
      const mapName = row.map_name;
      if (!mapLevelTierMap.has(mapName)) {
        mapLevelTierMap.set(mapName, { level: row.level, tier: row.tier });
      }
    });

    const mapSizeStats = (mapSizeQuery.results || []).map((row: any) => {
      const levelTier = mapLevelTierMap.get(row.mapSize) || { level: 'I', tier: 'I' };
      return {
        mapSize: row.mapSize || 'Unknown',
        totalRuns: row.totalRuns || 0,
        avgTokens: Math.round(row.avgTokens || 0),
        avgEfficiency: Math.round((row.avgEfficiency || 0) * 100) / 100,
        topLevel: levelTier.level,
        topTier: levelTier.tier,
        avgCharge: Math.round((row.avgCharge || 0) * 10) / 10
      };
    });

    // 2. ESTATÍSTICAS POR LEVEL E TIER
    const levelTierStatsQuery = await env.DB.prepare(`
      SELECT 
        level,
        tier,
        COUNT(*) as runs,
        AVG(tokens) as avgTokens,
        AVG(CASE WHEN efficiency > 0 THEN efficiency ELSE NULL END) as avgEfficiency
      FROM feed_runs 
      WHERE created_at > ? AND level IS NOT NULL AND tier IS NOT NULL
      GROUP BY level, tier
      ORDER BY runs DESC
    `).bind(fourWeeksAgo).all();

    // Buscar mapa mais popular para cada combinação level/tier
    const levelTierMapQuery = await env.DB.prepare(`
      SELECT 
        level,
        tier,
        map_name,
        COUNT(*) as frequency
      FROM feed_runs 
      WHERE created_at > ? AND level IS NOT NULL AND tier IS NOT NULL
      GROUP BY level, tier, map_name
      ORDER BY level, tier, frequency DESC
    `).bind(fourWeeksAgo).all();

    // Criar mapa de mapas mais populares por level/tier
    const levelTierMapMap = new Map();
    (levelTierMapQuery.results || []).forEach((row: any) => {
      const key = `${row.level}-${row.tier}`;
      if (!levelTierMapMap.has(key)) {
        levelTierMapMap.set(key, row.map_name);
      }
    });

    const levelTierStats = (levelTierStatsQuery.results || []).map((row: any) => {
      const key = `${row.level}-${row.tier}`;
      const popularMapSize = levelTierMapMap.get(key) || 'Medium';
      return {
        level: row.level || 'I',
        tier: row.tier || 'I',
        runs: row.runs || 0,
        avgTokens: Math.round(row.avgTokens || 0),
        avgEfficiency: Math.round((row.avgEfficiency || 0) * 100) / 100,
        popularMapSize: popularMapSize
      };
    });

    // 3. EFICIÊNCIA POR FAIXA DE CHARGE
    const chargeQuery = await env.DB.prepare(`
      SELECT 
        CASE 
          WHEN charge <= 5 THEN '1-5'
          WHEN charge <= 10 THEN '6-10'
          WHEN charge <= 20 THEN '11-20'
          WHEN charge <= 50 THEN '21-50'
          ELSE '50+'
        END as chargeRange,
        COUNT(*) as runs,
        AVG(tokens) as avgTokens,
        AVG(CASE WHEN efficiency > 0 THEN efficiency ELSE NULL END) as avgEfficiency
      FROM feed_runs 
      WHERE created_at > ? AND charge > 0
      GROUP BY chargeRange
      ORDER BY 
        CASE chargeRange
          WHEN '1-5' THEN 1
          WHEN '6-10' THEN 2
          WHEN '11-20' THEN 3
          WHEN '21-50' THEN 4
          ELSE 5
        END
    `).bind(fourWeeksAgo).all();

    const chargeEfficiency = (chargeQuery.results || []).map((row: any) => ({
      chargeRange: row.chargeRange,
      runs: row.runs || 0,
      avgTokens: Math.round(row.avgTokens || 0),
      avgEfficiency: Math.round((row.avgEfficiency || 0) * 100) / 100
    }));

    // 4. ATIVIDADE POR HORA
    const hourlyQuery = await env.DB.prepare(`
      SELECT 
        strftime('%H', datetime(created_at/1000, 'unixepoch')) as hour,
        COUNT(*) as runs,
        AVG(tokens) as avgTokens
      FROM feed_runs 
      WHERE created_at > ?
      GROUP BY hour
      ORDER BY hour
    `).bind(sevenDaysAgo).all();

    // Buscar level mais popular por hora
    const hourlyLevelQuery = await env.DB.prepare(`
      SELECT 
        strftime('%H', datetime(created_at/1000, 'unixepoch')) as hour,
        level,
        COUNT(*) as frequency
      FROM feed_runs 
      WHERE created_at > ? AND level IS NOT NULL
      GROUP BY hour, level
      ORDER BY hour, frequency DESC
    `).bind(sevenDaysAgo).all();

    // Criar mapa de levels mais populares por hora
    const hourlyLevelMap = new Map();
    (hourlyLevelQuery.results || []).forEach((row: any) => {
      const hour = parseInt(row.hour);
      if (!hourlyLevelMap.has(hour)) {
        hourlyLevelMap.set(hour, row.level);
      }
    });

    const hourlyActivity = Array.from({length: 24}, (_, i) => {
      const hourData = (hourlyQuery.results || []).find((row: any) => parseInt(row.hour) === i);
      const popularLevel = hourlyLevelMap.get(i) || 'I';
      return {
        hour: i,
        runs: hourData?.runs || 0,
        avgTokens: Math.round(hourData?.avgTokens || 0),
        popularLevel: popularLevel
      };
    });

    // 5. PADRÕES DE COMPORTAMENTO DE USUÁRIO
    const userBehaviorQuery = await env.DB.prepare(`
      SELECT 
        player_name,
        COUNT(*) as userRuns
      FROM feed_runs 
      WHERE created_at > ? AND player_name IS NOT NULL
      GROUP BY player_name
    `).bind(fourWeeksAgo).all();

    const userRunCounts = (userBehaviorQuery.results || []).map((row: any) => row.userRuns || 0);
    const totalUniqueUsers = userRunCounts.length;
    const avgRunsPerUser = totalUniqueUsers > 0 ? Math.round(userRunCounts.reduce((a, b) => a + b, 0) / totalUniqueUsers) : 0;
    const casualUsers = userRunCounts.filter(count => count < 5).length;
    const regularUsers = userRunCounts.filter(count => count >= 5 && count <= 20).length;
    const powerUsers = userRunCounts.filter(count => count > 20).length;

    // 6. ATIVIDADE RECENTE E CRESCIMENTO
    const recentActivityQueries = await Promise.all([
      env.DB.prepare('SELECT COUNT(*) as count FROM feed_runs WHERE created_at > ?').bind(twentyFourHoursAgo).first(),
      env.DB.prepare('SELECT COUNT(*) as count FROM feed_runs WHERE created_at > ?').bind(sevenDaysAgo).first(),
      env.DB.prepare('SELECT COUNT(*) as count FROM feed_runs WHERE created_at > ?').bind(thirtyDaysAgo).first(),
      env.DB.prepare('SELECT COUNT(*) as count FROM feed_runs WHERE created_at BETWEEN ? AND ?').bind(thirtyDaysAgo * 2, thirtyDaysAgo).first()
    ]);

    const last24h = recentActivityQueries[0]?.count || 0;
    const last7d = recentActivityQueries[1]?.count || 0;
    const last30d = recentActivityQueries[2]?.count || 0;
    const previous30d = recentActivityQueries[3]?.count || 0;
    const growthRate = previous30d > 0 ? Math.round(((last30d - previous30d) / previous30d) * 100) : 0;

    // Montar resposta
    const analytics: MapAnalytics = {
      mapSizeStats,
      levelTierStats,
      chargeEfficiency,
      hourlyActivity,
      userBehaviorPatterns: {
        totalUniqueUsers,
        avgRunsPerUser,
        casualUsers,
        regularUsers,
        powerUsers
      },
      recentActivity: {
        last24h,
        last7d,
        last30d,
        growthRate
      }
    };

    console.log('📊 Map analytics coletados:', {
      mapSizes: mapSizeStats.length,
      levelTiers: levelTierStats.length,
      users: totalUniqueUsers
    });

    // Salvar no cache
    if (env.KV) {
      try {
        await env.KV.put(CACHE_KEY, JSON.stringify(analytics), { expirationTtl: CACHE_TTL });
        console.log('💾 Map analytics salvos no cache');
      } catch (cacheError) {
        console.log('⚠️ Erro ao salvar cache:', cacheError);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      data: analytics,
      cached: false,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('❌ Erro no map analytics:', error);
    
    // Fallback com dados de exemplo
    const fallbackData: MapAnalytics = {
      mapSizeStats: [
        { mapSize: 'Medium', totalRuns: 450, avgTokens: 185, avgEfficiency: 0.82, topLevel: 'III', topTier: 'II', avgCharge: 8.3 },
        { mapSize: 'Large', totalRuns: 320, avgTokens: 310, avgEfficiency: 0.76, topLevel: 'IV', topTier: 'I', avgCharge: 12.1 },
        { mapSize: 'Small', totalRuns: 280, avgTokens: 95, avgEfficiency: 0.89, topLevel: 'II', topTier: 'I', avgCharge: 5.2 },
        { mapSize: 'XLarge', totalRuns: 150, avgTokens: 520, avgEfficiency: 0.68, topLevel: 'V', topTier: 'III', avgCharge: 18.7 }
      ],
      levelTierStats: [
        { level: 'III', tier: 'II', runs: 234, avgTokens: 275, avgEfficiency: 0.84, popularMapSize: 'Medium' },
        { level: 'IV', tier: 'I', runs: 187, avgTokens: 310, avgEfficiency: 0.79, popularMapSize: 'Large' },
        { level: 'II', tier: 'I', runs: 156, avgTokens: 150, avgEfficiency: 0.91, popularMapSize: 'Small' }
      ],
      chargeEfficiency: [
        { chargeRange: '1-5', runs: 156, avgTokens: 85, avgEfficiency: 0.94 },
        { chargeRange: '6-10', runs: 298, avgTokens: 185, avgEfficiency: 0.86 },
        { chargeRange: '11-20', runs: 187, avgTokens: 310, avgEfficiency: 0.78 },
        { chargeRange: '21-50', runs: 89, avgTokens: 520, avgEfficiency: 0.71 }
      ],
      hourlyActivity: Array.from({length: 24}, (_, i) => ({
        hour: i,
        runs: Math.max(0, Math.round(Math.random() * 50 + (i > 8 && i < 22 ? 20 : 5))),
        avgTokens: Math.round(Math.random() * 200 + 100),
        popularLevel: ['I', 'II', 'III', 'IV', 'V'][Math.floor(Math.random() * 5)]
      })),
      userBehaviorPatterns: {
        totalUniqueUsers: 47,
        avgRunsPerUser: 12,
        casualUsers: 23,
        regularUsers: 18,
        powerUsers: 6
      },
      recentActivity: {
        last24h: 23,
        last7d: 156,
        last30d: 623,
        growthRate: 18
      }
    };

    return new Response(JSON.stringify({
      success: true,
      data: fallbackData,
      fallback: true,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}