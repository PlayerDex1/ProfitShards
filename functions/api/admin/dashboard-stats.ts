interface Env {
  DB: D1Database;
}

interface DashboardStats {
  overview: {
    totalUsers: number;
    totalCalculations: number;
    totalProfit: number;
    averageROI: number;
    successRate: number;
    activeUsersToday: number;
    calculationsToday: number;
    bestProfit: number;
    averageEfficiency: number;
  };
  recentActivity: {
    recentCalculations: any[];
    recentUsers: any[];
    topPerformers: any[];
  };
  mapAnalytics: {
    mapSizeStats: any[];
    levelTierStats: any[];
    hourlyActivity: any[];
  };
  userMetrics: {
    newUsersToday: number;
    returningUsers: number;
    averageSessionTime: number;
    mostActiveHours: string[];
  };
  systemHealth: {
    databaseStatus: 'healthy' | 'warning' | 'error';
    cacheStatus: 'active' | 'inactive';
    lastUpdate: string;
  };
}

export async function onRequestGet({ env }: { env: Env }) {
  try {
    console.log('📊 DASHBOARD ADMIN: Buscando estatísticas reais...');

    if (!env.DB) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Database não disponível'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const now = Date.now();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayTimestamp = todayStart.getTime();
    const last24Hours = now - (24 * 60 * 60 * 1000);
    const last7Days = now - (7 * 24 * 60 * 60 * 1000);
    const last30Days = now - (30 * 24 * 60 * 60 * 1000);

    // 1. OVERVIEW STATS
    const overviewQueries = await Promise.all([
      // Total users
      env.DB.prepare('SELECT COUNT(DISTINCT user_id) as total FROM user_calculations').first(),
      // Total calculations
      env.DB.prepare('SELECT COUNT(*) as total FROM user_calculations').first(),
      // Total profit
      env.DB.prepare('SELECT SUM(final_profit) as total FROM user_calculations WHERE final_profit > 0').first(),
      // Average ROI
      env.DB.prepare('SELECT AVG(roi) as avg FROM user_calculations WHERE roi > 0').first(),
      // Success rate
      env.DB.prepare('SELECT COUNT(*) as total, SUM(CASE WHEN final_profit > 0 THEN 1 ELSE 0 END) as success FROM user_calculations').first(),
      // Active users today
      env.DB.prepare('SELECT COUNT(DISTINCT user_id) as total FROM user_calculations WHERE created_at >= ?').bind(todayTimestamp).first(),
      // Calculations today
      env.DB.prepare('SELECT COUNT(*) as total FROM user_calculations WHERE created_at >= ?').bind(todayTimestamp).first(),
      // Best profit
      env.DB.prepare('SELECT MAX(final_profit) as max FROM user_calculations').first(),
      // Average efficiency
      env.DB.prepare('SELECT AVG(efficiency) as avg FROM user_calculations WHERE efficiency > 0').first()
    ]);

    const successData = overviewQueries[4] || { total: 0, success: 0 };
    const successRate = successData.total > 0 ? (successData.success / successData.total) * 100 : 0;

    const overview = {
      totalUsers: overviewQueries[0]?.total || 0,
      totalCalculations: overviewQueries[1]?.total || 0,
      totalProfit: overviewQueries[2]?.total || 0,
      averageROI: overviewQueries[3]?.avg || 0,
      successRate: Math.round(successRate * 100) / 100,
      activeUsersToday: overviewQueries[5]?.total || 0,
      calculationsToday: overviewQueries[6]?.total || 0,
      bestProfit: overviewQueries[7]?.max || 0,
      averageEfficiency: overviewQueries[8]?.avg || 0
    };

    // 2. RECENT ACTIVITY
    const recentCalculations = await env.DB.prepare(`
      SELECT user_id, final_profit, roi, efficiency, created_at
      FROM user_calculations 
      ORDER BY created_at DESC 
      LIMIT 10
    `).all();

    const recentUsers = await env.DB.prepare(`
      SELECT user_id, COUNT(*) as calculations_count, MAX(created_at) as last_activity
      FROM user_calculations 
      WHERE created_at >= ?
      GROUP BY user_id 
      ORDER BY last_activity DESC 
      LIMIT 10
    `).bind(last24Hours).all();

    const topPerformers = await env.DB.prepare(`
      SELECT user_id, SUM(final_profit) as total_profit, AVG(roi) as avg_roi, COUNT(*) as calculations_count
      FROM user_calculations 
      WHERE final_profit > 0 AND created_at >= ?
      GROUP BY user_id 
      ORDER BY total_profit DESC 
      LIMIT 5
    `).bind(last7Days).all();

    // 3. MAP ANALYTICS (se existir tabela feed_runs)
    let mapAnalytics = {
      mapSizeStats: [],
      levelTierStats: [],
      hourlyActivity: []
    };

    try {
      const mapSizeStats = await env.DB.prepare(`
        SELECT 
          map_name,
          COUNT(*) as total_runs,
          AVG(tokens) as avg_tokens,
          AVG(efficiency) as avg_efficiency,
          AVG(charge) as avg_charge
        FROM feed_runs 
        WHERE created_at >= ?
        GROUP BY map_name 
        ORDER BY total_runs DESC
      `).bind(last7Days).all();

      const levelTierStats = await env.DB.prepare(`
        SELECT 
          level,
          tier,
          COUNT(*) as runs,
          AVG(tokens) as avg_tokens,
          AVG(efficiency) as avg_efficiency
        FROM feed_runs 
        WHERE created_at >= ?
        GROUP BY level, tier 
        ORDER BY runs DESC
      `).bind(last7Days).all();

      const hourlyActivity = await env.DB.prepare(`
        SELECT 
          strftime('%H', datetime(created_at/1000, 'unixepoch')) as hour,
          COUNT(*) as runs,
          AVG(tokens) as avg_tokens
        FROM feed_runs 
        WHERE created_at >= ?
        GROUP BY hour 
        ORDER BY hour
      `).bind(last24Hours).all();

      mapAnalytics = {
        mapSizeStats: mapSizeStats.results || [],
        levelTierStats: levelTierStats.results || [],
        hourlyActivity: hourlyActivity.results || []
      };
    } catch (error) {
      console.log('⚠️ Tabela feed_runs não encontrada, usando dados vazios');
    }

    // 4. USER METRICS
    const userMetricsQueries = await Promise.all([
      // New users today
      env.DB.prepare('SELECT COUNT(DISTINCT user_id) as count FROM user_calculations WHERE created_at >= ?').bind(todayTimestamp).first(),
      // Returning users (users with activity in last 7 days but not first time today)
      env.DB.prepare(`
        SELECT COUNT(DISTINCT user_id) as count 
        FROM user_calculations 
        WHERE user_id IN (
          SELECT DISTINCT user_id FROM user_calculations WHERE created_at >= ?
        ) AND user_id NOT IN (
          SELECT DISTINCT user_id FROM user_calculations WHERE created_at >= ? AND created_at < ?
        )
      `).bind(last7Days, todayTimestamp, now).first()
    ]);

    const userMetrics = {
      newUsersToday: userMetricsQueries[0]?.count || 0,
      returningUsers: userMetricsQueries[1]?.count || 0,
      averageSessionTime: 0, // Placeholder - would need session tracking
      mostActiveHours: ['14:00', '19:00', '21:00'] // Placeholder
    };

    // 5. SYSTEM HEALTH
    const systemHealth = {
      databaseStatus: 'healthy' as const,
      cacheStatus: 'active' as const,
      lastUpdate: new Date().toISOString()
    };

    const dashboardStats: DashboardStats = {
      overview,
      recentActivity: {
        recentCalculations: recentCalculations.results || [],
        recentUsers: recentUsers.results || [],
        topPerformers: topPerformers.results || []
      },
      mapAnalytics,
      userMetrics,
      systemHealth
    };

    console.log('📊 Dashboard stats geradas:', {
      totalUsers: overview.totalUsers,
      totalCalculations: overview.totalCalculations,
      totalProfit: overview.totalProfit,
      activeUsersToday: overview.activeUsersToday
    });

    return new Response(JSON.stringify({
      success: true,
      data: dashboardStats,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache' // Sempre buscar dados frescos
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas do dashboard:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      data: null
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// Handle preflight requests
export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}