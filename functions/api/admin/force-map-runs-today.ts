interface Env {
  DB: D1Database;
}

interface MapRunData {
  mapSize: string;
  luck: number;
  loads: number;
  tokensDropped: number;
  timestamp: number;
}

// Função para gerar dados realistas de map runs
function generateRealisticMapRuns(count: number = 50): MapRunData[] {
  const mapSizes = ['small', 'medium', 'large', 'xlarge'];
  const runs: MapRunData[] = [];
  
  // Obter timestamp de hoje (início do dia)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = today.getTime();
  
  // Gerar runs distribuídas ao longo do dia
  for (let i = 0; i < count; i++) {
    const mapSize = mapSizes[Math.floor(Math.random() * mapSizes.length)];
    const luck = Math.floor(Math.random() * 100) + 1; // 1-100
    const loads = Math.floor(Math.random() * 5) + 1; // 1-5 loads
    
    // Tokens baseados no tamanho do mapa e sorte
    let baseTokens = 0;
    switch (mapSize) {
      case 'small': baseTokens = 80 + Math.floor(Math.random() * 40); break; // 80-120
      case 'medium': baseTokens = 150 + Math.floor(Math.random() * 80); break; // 150-230
      case 'large': baseTokens = 250 + Math.floor(Math.random() * 120); break; // 250-370
      case 'xlarge': baseTokens = 400 + Math.floor(Math.random() * 200); break; // 400-600
    }
    
    // Aplicar multiplicador de sorte
    const luckMultiplier = 1 + (luck - 50) / 100; // 0.5x a 1.5x
    const tokensDropped = Math.floor(baseTokens * luckMultiplier * loads);
    
    // Timestamp distribuído ao longo do dia
    const hoursOffset = Math.floor(Math.random() * 24);
    const minutesOffset = Math.floor(Math.random() * 60);
    const timestamp = todayTimestamp + (hoursOffset * 60 + minutesOffset) * 60 * 1000;
    
    runs.push({
      mapSize,
      luck,
      loads,
      tokensDropped,
      timestamp
    });
  }
  
  return runs.sort((a, b) => b.timestamp - a.timestamp); // Mais recente primeiro
}

// Função para obter custo de energia baseado no tamanho do mapa
function getEnergyFromMapSize(mapSize: string): number {
  switch (mapSize) {
    case 'small': return 5;
    case 'medium': return 10;
    case 'large': return 20;
    case 'xlarge': return 40;
    default: return 10;
  }
}

// Função para formatar nome do mapa
function formatMapName(mapSize: string): string {
  switch (mapSize) {
    case 'small': return 'Small Map';
    case 'medium': return 'Medium Map';
    case 'large': return 'Large Map';
    case 'xlarge': return 'XLarge Map';
    default: return 'Unknown Map';
  }
}

export async function onRequestPost(context: { env: Env; request: Request }) {
  try {
    const { env, request } = context;
    
    console.log('🚀 FORCE MAP RUNS TODAY: Iniciando...');
    
    if (!env.DB) {
      console.log('❌ D1 Database não disponível');
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Database not available' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar se é uma requisição de força (com parâmetro force=true)
    const url = new URL(request.url);
    const force = url.searchParams.get('force');
    
    if (force !== 'true') {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Use ?force=true to confirm this action' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Gerar dados realistas para hoje
    const mapRuns = generateRealisticMapRuns(75); // 75 runs para hoje
    console.log(`📊 Gerando ${mapRuns.length} map runs para hoje...`);

    // Garantir que as tabelas existem
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS feed_runs (
        id TEXT PRIMARY KEY,
        user_email TEXT,
        map_name TEXT NOT NULL,
        luck INTEGER DEFAULT 0,
        tokens INTEGER NOT NULL,
        efficiency REAL DEFAULT 0,
        created_at INTEGER NOT NULL
      )
    `).run();

    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS user_map_drops (
        id TEXT PRIMARY KEY,
        user_email TEXT,
        map_name TEXT NOT NULL,
        map_size TEXT NOT NULL,
        luck_value INTEGER DEFAULT 0,
        tokens_dropped INTEGER NOT NULL,
        loads INTEGER DEFAULT 1,
        efficiency REAL DEFAULT 0,
        energy_cost INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL
      )
    `).run();

    // Limpar dados de hoje primeiro (se existirem)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();
    const tomorrowTimestamp = todayTimestamp + 24 * 60 * 60 * 1000;

    console.log('🧹 Limpando dados existentes de hoje...');
    await env.DB.prepare(`
      DELETE FROM feed_runs 
      WHERE created_at >= ? AND created_at < ?
    `).bind(todayTimestamp, tomorrowTimestamp).run();

    await env.DB.prepare(`
      DELETE FROM user_map_drops 
      WHERE created_at >= ? AND created_at < ?
    `).bind(todayTimestamp, tomorrowTimestamp).run();

    // Inserir novos dados
    let insertedCount = 0;
    const userEmails = [
      'user1@example.com',
      'user2@example.com', 
      'user3@example.com',
      'user4@example.com',
      'user5@example.com',
      'gamer@profitshards.com',
      'player@worldshards.com',
      'miner@crypto.com',
      'trader@defi.com',
      'farmer@yield.com'
    ];

    for (const run of mapRuns) {
      const runId = `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const userEmail = userEmails[Math.floor(Math.random() * userEmails.length)];
      const energyCost = getEnergyFromMapSize(run.mapSize);
      const efficiency = run.tokensDropped / energyCost;
      const mapName = formatMapName(run.mapSize);

      // Inserir na tabela feed_runs
      await env.DB.prepare(`
        INSERT INTO feed_runs (id, user_email, map_name, luck, tokens, efficiency, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        runId,
        userEmail,
        mapName,
        run.luck,
        run.tokensDropped,
        efficiency,
        run.timestamp
      ).run();

      // Inserir na tabela user_map_drops
      await env.DB.prepare(`
        INSERT INTO user_map_drops (id, user_email, map_name, map_size, luck_value, tokens_dropped, loads, efficiency, energy_cost, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        runId,
        userEmail,
        mapName,
        run.mapSize,
        run.luck,
        run.tokensDropped,
        run.loads,
        efficiency,
        energyCost,
        run.timestamp
      ).run();

      insertedCount++;
    }

    console.log(`✅ ${insertedCount} map runs inseridos para hoje!`);

    return new Response(JSON.stringify({
      success: true,
      message: `Forçados ${insertedCount} map runs para hoje`,
      data: {
        runsCreated: insertedCount,
        date: new Date().toISOString().split('T')[0],
        timestamp: Date.now()
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erro forçando map runs:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}