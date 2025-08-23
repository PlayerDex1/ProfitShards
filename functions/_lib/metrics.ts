export interface Env {
  DB: D1Database;
}

// Estrutura das métricas anônimas
export interface FarmingMetrics {
  id: string;
  user_hash: string; // Hash anônimo do usuário (não identificável)
  luck_value: number;
  investment: number;
  tokens_farmed: number;
  tokens_equipment: number;
  gems_consumed: number;
  loads_used: number;
  final_profit: number;
  roi: number;
  efficiency_tokens_per_load: number;
  efficiency_tokens_per_energy: number;
  map_type?: string;
  session_date: string; // YYYY-MM-DD para agrupamento
  created_at: number;
}

// Função para criar hash anônimo do usuário
function createUserHash(userId: string): string {
  // Criar hash simples mas anônimo baseado no userId
  const encoder = new TextEncoder();
  const data = encoder.encode(userId + 'salt_profitshards_2024');
  
  // Usar crypto.subtle seria ideal, mas para simplicidade:
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data[i];
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36).substring(0, 8);
}

// Salvar métricas de cálculo
export async function saveFarmingMetrics(
  env: Env,
  userId: string,
  calculationData: any,
  results: any
): Promise<void> {
  try {
    // Criar tabela se não existir
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS farming_metrics (
        id TEXT PRIMARY KEY,
        user_hash TEXT NOT NULL,
        luck_value REAL NOT NULL,
        investment REAL NOT NULL,
        tokens_farmed REAL NOT NULL,
        tokens_equipment REAL NOT NULL,
        gems_consumed REAL NOT NULL,
        loads_used REAL NOT NULL,
        final_profit REAL NOT NULL,
        roi REAL NOT NULL,
        efficiency_tokens_per_load REAL,
        efficiency_tokens_per_energy REAL,
        map_type TEXT,
        session_date TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )
    `).run();

    // Criar índices para performance
    await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_farming_metrics_session_date ON farming_metrics(session_date)').run();
    await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_farming_metrics_luck_value ON farming_metrics(luck_value)').run();
    await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_farming_metrics_user_hash ON farming_metrics(user_hash)').run();

    const userHash = createUserHash(userId);
    const sessionDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    const metrics: FarmingMetrics = {
      id: crypto.randomUUID(),
      user_hash: userHash,
      luck_value: calculationData.luck || 0,
      investment: calculationData.investment || 0,
      tokens_farmed: calculationData.tokensFarmed || 0,
      tokens_equipment: calculationData.tokensEquipment || 0,
      gems_consumed: calculationData.gemsConsumed || 0,
      loads_used: calculationData.loadsUsed || 0,
      final_profit: results.finalProfit || 0,
      roi: results.roi || 0,
      efficiency_tokens_per_load: (calculationData.tokensFarmed + calculationData.tokensEquipment) / Math.max(calculationData.loadsUsed, 1),
      efficiency_tokens_per_energy: (calculationData.tokensFarmed + calculationData.tokensEquipment) / Math.max(calculationData.loadsUsed * 10, 1),
      map_type: calculationData.mapType || 'unknown',
      session_date: sessionDate,
      created_at: Date.now()
    };

    await env.DB.prepare(`
      INSERT INTO farming_metrics (
        id, user_hash, luck_value, investment, tokens_farmed, tokens_equipment,
        gems_consumed, loads_used, final_profit, roi, efficiency_tokens_per_load,
        efficiency_tokens_per_energy, map_type, session_date, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      metrics.id, metrics.user_hash, metrics.luck_value, metrics.investment,
      metrics.tokens_farmed, metrics.tokens_equipment, metrics.gems_consumed,
      metrics.loads_used, metrics.final_profit, metrics.roi,
      metrics.efficiency_tokens_per_load, metrics.efficiency_tokens_per_energy,
      metrics.map_type, metrics.session_date, metrics.created_at
    ).run();

    console.log(`📊 Farming metrics saved for user hash: ${userHash}`);
  } catch (error) {
    console.error('Failed to save farming metrics:', error);
  }
}

// Salvar métricas de map drops
export async function saveMapDropMetrics(
  env: Env,
  userId: string,
  mapData: any
): Promise<void> {
  try {
    // Criar tabela se não existir
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS map_drop_metrics (
        id TEXT PRIMARY KEY,
        user_hash TEXT NOT NULL,
        map_name TEXT NOT NULL,
        luck_value REAL NOT NULL,
        loads_completed INTEGER NOT NULL,
        tokens_dropped REAL NOT NULL,
        efficiency_tokens_per_load REAL NOT NULL,
        efficiency_tokens_per_energy REAL NOT NULL,
        session_date TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )
    `).run();

    await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_map_drop_metrics_session_date ON map_drop_metrics(session_date)').run();
    await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_map_drop_metrics_luck_value ON map_drop_metrics(luck_value)').run();

    const userHash = createUserHash(userId);
    const sessionDate = new Date().toISOString().split('T')[0];
    
    const metrics = {
      id: crypto.randomUUID(),
      user_hash: userHash,
      map_name: mapData.mapName || 'unknown',
      luck_value: mapData.luck || 0,
      loads_completed: mapData.loads || 0,
      tokens_dropped: mapData.tokensDropped || 0,
      efficiency_tokens_per_load: (mapData.tokensDropped || 0) / Math.max(mapData.loads || 1, 1),
      efficiency_tokens_per_energy: (mapData.tokensDropped || 0) / Math.max((mapData.loads || 1) * 10, 1),
      session_date: sessionDate,
      created_at: Date.now()
    };

    await env.DB.prepare(`
      INSERT INTO map_drop_metrics (
        id, user_hash, map_name, luck_value, loads_completed, tokens_dropped,
        efficiency_tokens_per_load, efficiency_tokens_per_energy, session_date, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      metrics.id, metrics.user_hash, metrics.map_name, metrics.luck_value,
      metrics.loads_completed, metrics.tokens_dropped, metrics.efficiency_tokens_per_load,
      metrics.efficiency_tokens_per_energy, metrics.session_date, metrics.created_at
    ).run();

    console.log(`🗺️ Map drop metrics saved for user hash: ${userHash}`);
  } catch (error) {
    console.error('Failed to save map drop metrics:', error);
  }
}

// Buscar métricas agregadas (apenas para admin)
export async function getAggregatedMetrics(env: Env, days: number = 30) {
  try {
    const daysAgo = Date.now() - (days * 24 * 60 * 60 * 1000);
    
    // Métricas de farming por luck
    const farmingByLuck = await env.DB.prepare(`
      SELECT 
        ROUND(luck_value / 10) * 10 as luck_range,
        COUNT(*) as total_calculations,
        AVG(final_profit) as avg_profit,
        AVG(roi) as avg_roi,
        AVG(efficiency_tokens_per_load) as avg_tokens_per_load,
        AVG(efficiency_tokens_per_energy) as avg_tokens_per_energy,
        COUNT(DISTINCT user_hash) as unique_users
      FROM farming_metrics 
      WHERE created_at > ?
      GROUP BY luck_range
      ORDER BY luck_range
    `).bind(daysAgo).all();

    // Métricas de map drops por luck
    const mapDropsByLuck = await env.DB.prepare(`
      SELECT 
        ROUND(luck_value / 10) * 10 as luck_range,
        COUNT(*) as total_runs,
        AVG(tokens_dropped) as avg_tokens_dropped,
        AVG(efficiency_tokens_per_load) as avg_efficiency,
        COUNT(DISTINCT user_hash) as unique_users
      FROM map_drop_metrics 
      WHERE created_at > ?
      GROUP BY luck_range
      ORDER BY luck_range
    `).bind(daysAgo).all();

    // Top performers (anônimos)
    const topPerformers = await env.DB.prepare(`
      SELECT 
        user_hash,
        COUNT(*) as total_calculations,
        AVG(final_profit) as avg_profit,
        MAX(final_profit) as best_profit,
        AVG(luck_value) as avg_luck
      FROM farming_metrics 
      WHERE created_at > ? AND final_profit > 0
      GROUP BY user_hash
      ORDER BY avg_profit DESC
      LIMIT 10
    `).bind(daysAgo).all();

    // Estatísticas gerais
    const generalStats = await env.DB.prepare(`
      SELECT 
        COUNT(*) as total_calculations,
        COUNT(DISTINCT user_hash) as active_users,
        AVG(final_profit) as global_avg_profit,
        AVG(luck_value) as global_avg_luck,
        SUM(CASE WHEN final_profit > 0 THEN 1 ELSE 0 END) as profitable_calculations
      FROM farming_metrics 
      WHERE created_at > ?
    `).bind(daysAgo).first();

    return {
      farmingByLuck: farmingByLuck.results,
      mapDropsByLuck: mapDropsByLuck.results,
      topPerformers: topPerformers.results,
      generalStats,
      period: `${days} days`,
      generated_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to get aggregated metrics:', error);
    return null;
  }
}