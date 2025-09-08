import { addSecurityHeaders } from '../../_lib/security';

interface Env {
  DB: D1Database;
}

// Funções auxiliares para calcular estatísticas
function calculateStatsByCategory(calculations: any[], category: string) {
  const stats = new Map();
  
  calculations.forEach(calc => {
    const key = calc[category];
    if (!stats.has(key)) {
      stats.set(key, {
        [category]: key,
        count: 0,
        totalProfit: 0,
        totalEfficiency: 0,
        calculations: []
      });
    }
    
    const stat = stats.get(key);
    stat.count++;
    stat.totalProfit += calc.total_profit;
    stat.totalEfficiency += calc.efficiency;
    stat.calculations.push(calc);
  });
  
  return Array.from(stats.values())
    .map(stat => ({
      [category]: stat[category],
      count: stat.count,
      avgProfit: Math.round((stat.totalProfit / stat.count) * 100) / 100,
      avgEfficiency: Math.round((stat.totalEfficiency / stat.count) * 100) / 100,
      totalProfit: stat.totalProfit
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function calculateEfficiencyRanges(calculations: any[]) {
  const ranges = {
    '0-50%': { count: 0, totalProfit: 0 },
    '50-70%': { count: 0, totalProfit: 0 },
    '70-85%': { count: 0, totalProfit: 0 },
    '85-95%': { count: 0, totalProfit: 0 },
    '95-100%': { count: 0, totalProfit: 0 }
  };
  
  calculations.forEach(calc => {
    const efficiency = calc.efficiency;
    let range;
    
    if (efficiency < 50) range = '0-50%';
    else if (efficiency < 70) range = '50-70%';
    else if (efficiency < 85) range = '70-85%';
    else if (efficiency < 95) range = '85-95%';
    else range = '95-100%';
    
    ranges[range].count++;
    ranges[range].totalProfit += calc.total_profit;
  });
  
  return Object.entries(ranges)
    .map(([range, data]) => ({
      range,
      count: data.count,
      avgProfit: data.count > 0 ? Math.round((data.totalProfit / data.count) * 100) / 100 : 0
    }))
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count);
}

function calculateProfitRanges(calculations: any[]) {
  const ranges = {
    '0-1K': { count: 0, totalEfficiency: 0 },
    '1K-5K': { count: 0, totalEfficiency: 0 },
    '5K-10K': { count: 0, totalEfficiency: 0 },
    '10K-25K': { count: 0, totalEfficiency: 0 },
    '25K+': { count: 0, totalEfficiency: 0 }
  };
  
  calculations.forEach(calc => {
    const profit = calc.total_profit;
    let range;
    
    if (profit < 1000) range = '0-1K';
    else if (profit < 5000) range = '1K-5K';
    else if (profit < 10000) range = '5K-10K';
    else if (profit < 25000) range = '10K-25K';
    else range = '25K+';
    
    ranges[range].count++;
    ranges[range].totalEfficiency += calc.efficiency;
  });
  
  return Object.entries(ranges)
    .map(([range, data]) => ({
      range,
      count: data.count,
      avgEfficiency: data.count > 0 ? Math.round((data.totalEfficiency / data.count) * 100) / 100 : 0
    }))
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count);
}

function calculateRecentActivity(calculations: any[]) {
  const activity = new Map();
  
  calculations.forEach(calc => {
    const date = new Date(calc.created_at).toISOString().split('T')[0];
    
    if (!activity.has(date)) {
      activity.set(date, {
        date,
        calculations: 0,
        totalProfit: 0,
        totalEfficiency: 0
      });
    }
    
    const dayActivity = activity.get(date);
    dayActivity.calculations++;
    dayActivity.totalProfit += calc.total_profit;
    dayActivity.totalEfficiency += calc.efficiency;
  });
  
  return Array.from(activity.values())
    .map(day => ({
      date: day.date,
      calculations: day.calculations,
      avgProfit: Math.round((day.totalProfit / day.calculations) * 100) / 100,
      totalProfit: day.totalProfit
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7);
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

    // Buscar cálculos de lucro da tabela user_calculations
    const profitCalculations = await env.DB.prepare(`
      SELECT 
        uc.calculation_data,
        uc.result_data,
        uc.created_at,
        u.email
      FROM user_calculations uc
      JOIN users u ON uc.user_id = u.id
      WHERE uc.calculation_type = 'profit' 
        AND uc.created_at > ?
      ORDER BY uc.created_at DESC
    `).bind(Date.now() - (30 * 24 * 60 * 60 * 1000)).all();

    console.log(`📊 Encontrados ${profitCalculations.results?.length || 0} cálculos de lucro`);

    if (!profitCalculations.results || profitCalculations.results.length === 0) {
      console.log('📊 Nenhum cálculo de lucro encontrado');
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
        message: 'Nenhum cálculo de lucro encontrado nos últimos 30 dias'
      });
      return addSecurityHeaders(response);
    }

    // Processar dados dos cálculos
    const calculations = (profitCalculations.results || []).map((calc: any) => {
      const data = JSON.parse(calc.calculation_data);
      const results = JSON.parse(calc.result_data);
      
      console.log('🔍 DEBUG - Dados brutos:', {
        calculation_data: data,
        result_data: results,
        total_profit: results.totalProfit
      });
      
      return {
        token_price: data.tokenPrice || 0,
        tokens_farmed: data.tokensFarmed || 0,
        total_profit: results.totalProfit || 0,
        efficiency: results.efficiency || 0,
        level: data.level || 'Unknown',
        tier: data.tier || 'Unknown',
        luck: data.luck || 0,
        charge: data.charge || 0,
        map_size: data.mapSize || 'Unknown',
        created_at: calc.created_at,
        user_email: calc.email
      };
    });

    console.log('🔍 DEBUG - Cálculos processados:', calculations.slice(0, 3));

    // Calcular estatísticas gerais
    const totalCalculations = calculations.length;
    const totalProfit = calculations.reduce((sum, calc) => sum + calc.total_profit, 0);
    const avgProfit = totalCalculations > 0 ? totalProfit / totalCalculations : 0;
    const avgEfficiency = totalCalculations > 0 ? calculations.reduce((sum, calc) => sum + calc.efficiency, 0) / totalCalculations : 0;
    const avgTokenPrice = totalCalculations > 0 ? calculations.reduce((sum, calc) => sum + calc.token_price, 0) / totalCalculations : 0;
    const avgTokensFarmed = totalCalculations > 0 ? calculations.reduce((sum, calc) => sum + calc.tokens_farmed, 0) / totalCalculations : 0;

    // Calcular estatísticas por categoria
    const levelStats = calculateStatsByCategory(calculations, 'level');
    const tierStats = calculateStatsByCategory(calculations, 'tier');
    const mapSizeStats = calculateStatsByCategory(calculations, 'map_size');
    
    // Buscar mais populares
    const topLevel = levelStats.length > 0 ? levelStats[0] : { level: 'N/A', count: 0 };
    const topTier = tierStats.length > 0 ? tierStats[0] : { tier: 'N/A', count: 0 };
    const topMapSize = mapSizeStats.length > 0 ? mapSizeStats[0] : { map_size: 'N/A', count: 0 };

    // Faixas de eficiência
    const efficiencyRanges = calculateEfficiencyRanges(calculations);
    
    // Faixas de lucro
    const profitRanges = calculateProfitRanges(calculations);
    
    // Atividade recente (últimos 7 dias)
    const recentActivity = calculateRecentActivity(calculations);

    console.log(`📊 Estatísticas de lucro carregadas: ${totalCalculations} cálculos`);

    const response = Response.json({
      success: true,
      stats: {
        totalCalculations,
        totalProfit: Math.round(totalProfit * 100) / 100,
        avgProfit: Math.round(avgProfit * 100) / 100,
        avgEfficiency: Math.round(avgEfficiency * 100) / 100,
        topLevel: topLevel.level || 'N/A',
        topTier: topTier.tier || 'N/A',
        topMapSize: topMapSize.map_size || 'N/A',
        avgTokenPrice: Math.round(avgTokenPrice * 100) / 100,
        avgTokensFarmed: Math.round(avgTokensFarmed * 100) / 100,
        levelStats,
        tierStats,
        mapSizeStats,
        efficiencyRanges,
        profitRanges,
        recentActivity
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