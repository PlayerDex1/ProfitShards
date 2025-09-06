interface Env {
  DB: D1Database;
}

interface GlobalStats {
  totalUsers: number;
  totalCalculations: number;
  totalProfit: number;
  averageROI: number;
  successRate: number;
  activeUsersToday: number;
  calculationsToday: number;
  bestProfit: number;
  averageEfficiency: number;
}

export async function onRequestGet({ env }: { env: Env }) {
  try {
    // Verificar se a tabela existe
    let tableExists = false;
    try {
      await env.DB.prepare(`SELECT COUNT(*) FROM user_calculations LIMIT 1`).first();
      tableExists = true;
    } catch (error) {
      console.log('Tabela user_calculations não existe ou está vazia');
    }

    let userStats = null;
    
    if (tableExists) {
      // Buscar estatísticas dos usuários
      userStats = await env.DB.prepare(`
        SELECT 
          COUNT(DISTINCT user_id) as total_users,
          COUNT(*) as total_calculations,
          SUM(final_profit) as total_profit,
          AVG(roi) as average_roi,
          COUNT(CASE WHEN final_profit > 0 THEN 1 END) * 100.0 / COUNT(*) as success_rate,
          MAX(final_profit) as best_profit,
          AVG(efficiency) as average_efficiency
        FROM user_calculations
        WHERE created_at > ?
      `).bind(Date.now() - (30 * 24 * 60 * 60 * 1000)) // Últimos 30 dias
      .first();
    }

    // Buscar usuários ativos hoje
    let todayStats = null;
    if (tableExists) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayTimestamp = todayStart.getTime();

      todayStats = await env.DB.prepare(`
        SELECT 
          COUNT(DISTINCT user_id) as active_users_today,
          COUNT(*) as calculations_today
        FROM user_calculations
        WHERE created_at >= ?
      `).bind(todayTimestamp).first();
    }

    // Buscar estatísticas de map runs (se existir tabela)
    let mapStats = { total_map_runs: 0, total_tokens_farmed: 0 };
    try {
      const mapData = await env.DB.prepare(`
        SELECT 
          COUNT(*) as total_map_runs,
          SUM(tokens_farmed) as total_tokens_farmed
        FROM map_runs
        WHERE created_at > ?
      `).bind(Date.now() - (30 * 24 * 60 * 60 * 1000)).first();
      
      if (mapData) {
        mapStats = mapData;
      }
    } catch (error) {
      console.log('Map runs table not found, using default values');
    }

    // Buscar estatísticas de giveaways (se existir tabela)
    let giveawayStats = { total_giveaways: 0, total_participants: 0 };
    try {
      const giveawayData = await env.DB.prepare(`
        SELECT 
          COUNT(*) as total_giveaways,
          SUM(participant_count) as total_participants
        FROM giveaways
        WHERE created_at > ?
      `).bind(Date.now() - (30 * 24 * 60 * 60 * 1000)).first();
      
      if (giveawayData) {
        giveawayStats = giveawayData;
      }
    } catch (error) {
      console.log('Giveaways table not found, using default values');
    }

    // Dados de demonstração para desenvolvimento
    const isDevelopment = !tableExists || (userStats?.total_calculations || 0) === 0;
    
    const stats: GlobalStats = isDevelopment ? {
      // Dados de demonstração realistas
      totalUsers: 1247,
      totalCalculations: 15689,
      totalProfit: 45678.90,
      averageROI: 187.5,
      successRate: 89.2,
      activeUsersToday: 156,
      calculationsToday: 234,
      bestProfit: 1250.75,
      averageEfficiency: 4.2,
    } : {
      // Dados reais do banco
      totalUsers: userStats?.total_users || 0,
      totalCalculations: userStats?.total_calculations || 0,
      totalProfit: userStats?.total_profit || 0,
      averageROI: userStats?.average_roi || 0,
      successRate: userStats?.success_rate || 0,
      activeUsersToday: todayStats?.active_users_today || 0,
      calculationsToday: todayStats?.calculations_today || 0,
      bestProfit: userStats?.best_profit || 0,
      averageEfficiency: userStats?.average_efficiency || 0,
    };

    // Adicionar dados de map runs e giveaways
    const extendedStats = {
      ...stats,
      totalMapRuns: mapStats.total_map_runs || 0,
      totalTokensFarmed: mapStats.total_tokens_farmed || 0,
      totalGiveaways: giveawayStats.total_giveaways || 0,
      totalParticipants: giveawayStats.total_participants || 0,
    };

    return new Response(JSON.stringify({
      success: true,
      data: extendedStats,
      timestamp: new Date().toISOString(),
      period: '30_days',
      isDemo: isDevelopment
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300' // Cache por 5 minutos
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas globais:', error);
    
    // Retornar dados padrão em caso de erro
    const fallbackStats = {
      totalUsers: 0,
      totalCalculations: 0,
      totalProfit: 0,
      averageROI: 0,
      successRate: 0,
      activeUsersToday: 0,
      calculationsToday: 0,
      bestProfit: 0,
      averageEfficiency: 0,
      totalMapRuns: 0,
      totalTokensFarmed: 0,
      totalGiveaways: 0,
      totalParticipants: 0,
    };

    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      data: fallbackStats,
      timestamp: new Date().toISOString()
    }), {
      status: 200, // Retorna 200 mesmo com erro para não quebrar a UI
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