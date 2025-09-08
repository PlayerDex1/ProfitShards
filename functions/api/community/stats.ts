import { addSecurityHeaders } from '../../_lib/security';

interface Env {
  DB: D1Database;
}

export async function onRequestGet({ env, request }: { env: Env; request: Request }) {
  try {
    console.log('📊 COMUNITY STATS: Coletando estatísticas da comunidade');

    // Verificar se DB existe
    if (!env.DB) {
      const response = Response.json({ 
        error: 'Database not available' 
      }, { status: 500 });
      return addSecurityHeaders(response);
    }

    // Buscar estatísticas de usuários
    const userStats = await env.DB.prepare(`
      SELECT 
        COUNT(DISTINCT u.id) as total_users,
        COUNT(DISTINCT CASE WHEN uc.created_at > ? THEN u.id END) as active_users_30d
      FROM users u
      LEFT JOIN user_calculations uc ON u.id = uc.user_id
    `).bind(Date.now() - (30 * 24 * 60 * 60 * 1000)).first() as { 
      total_users: number; 
      active_users_30d: number; 
    };

    // Buscar estatísticas de cálculos
    const calculationStats = await env.DB.prepare(`
      SELECT 
        COUNT(*) as total_calculations,
        COUNT(CASE WHEN calculation_type = 'profit' THEN 1 END) as profit_calculations,
        COUNT(CASE WHEN calculation_type = 'mapdrops' THEN 1 END) as map_calculations,
        COUNT(CASE WHEN created_at > ? THEN 1 END) as calculations_30d
      FROM user_calculations
    `).bind(Date.now() - (30 * 24 * 60 * 60 * 1000)).first() as {
      total_calculations: number;
      profit_calculations: number;
      map_calculations: number;
      calculations_30d: number;
    };

    // Buscar estatísticas de lucros (apenas cálculos de profit)
    const profitStats = await env.DB.prepare(`
      SELECT 
        uc.calculation_data,
        uc.result_data
      FROM user_calculations uc
      WHERE uc.calculation_type = 'profit'
        AND uc.created_at > ?
    `).bind(Date.now() - (30 * 24 * 60 * 60 * 1000)).all();

    // Processar dados de lucro
    let totalProfit = 0;
    let totalTokens = 0;
    let totalEfficiency = 0;
    let successCount = 0;

    if (profitStats.results && profitStats.results.length > 0) {
      profitStats.results.forEach((calc: any) => {
        try {
          const data = JSON.parse(calc.calculation_data);
          const results = JSON.parse(calc.result_data);
          
          // Somar lucro (usar finalProfit se disponível)
          const profit = results.finalProfit || results.netProfit || results.totalProfit || 0;
          totalProfit += profit;
          
          // Somar tokens
          const tokens = data.tokensFarmed || 0;
          totalTokens += tokens;
          
          // Calcular eficiência
          const efficiency = results.efficiency || 0;
          totalEfficiency += efficiency;
          
          // Contar como sucesso se eficiência > 50%
          if (efficiency > 0.5) {
            successCount++;
          }
        } catch (error) {
          console.log('Erro ao processar cálculo:', error);
        }
      });
    }

    // Calcular estatísticas finais
    const totalCalculations = calculationStats.total_calculations || 0;
    const activeUsers = userStats.active_users_30d || 0;
    const successRate = totalCalculations > 0 ? Math.round((successCount / totalCalculations) * 100) : 0;
    const avgEfficiency = profitStats.results?.length > 0 ? Math.round((totalEfficiency / profitStats.results.length) * 100) / 100 : 0;
    
    // Calcular satisfação baseada na eficiência média
    const satisfaction = Math.min(5, Math.max(1, (avgEfficiency * 5)));

    const communityStats = {
      activeUsers: activeUsers,
      totalCalculations: totalCalculations,
      successRate: successRate,
      satisfaction: Math.round(satisfaction * 10) / 10, // Arredondar para 1 casa decimal
      totalProfit: 0, // Zerado - contabilização a partir de 09/09/2025
      totalTokens: 0, // Zerado - contabilização a partir de 09/09/2025
      totalMaps: calculationStats.map_calculations || 0,
      avgEfficiency: avgEfficiency,
      lastUpdated: Date.now()
    };

    console.log('📊 Estatísticas da comunidade:', communityStats);

    const response = Response.json({
      success: true,
      stats: communityStats
    });
    
    return addSecurityHeaders(response);

  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas da comunidade:', error);
    const response = Response.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 });
    return addSecurityHeaders(response);
  }
}