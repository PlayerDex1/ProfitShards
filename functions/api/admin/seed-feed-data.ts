// 🌱 SEED FEED DATA - Adicionar dados de exemplo para testar dashboard
// API para popular o feed com dados realistas para desenvolvimento

interface Env {
  DB: D1Database;
}

interface SeedRun {
  mapSize: string;
  luck: number;
  tokens: number;
  level: string;
  tier: string;
  charge: number;
  playerName: string;
  timestamp: number;
}

export async function onRequestPost({ env }: { env: Env }) {
  try {
    console.log('🌱 SEED FEED: Adicionando dados de exemplo...');

    if (!env.DB) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Database not available'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar se já existem dados
    const existingCount = await env.DB.prepare(`
      SELECT COUNT(*) as total FROM feed_runs
    `).first() as { total: number } | null;

    if ((existingCount?.total || 0) > 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Feed already has data. Use clear-feed first if you want to replace it.',
        existingRecords: existingCount?.total || 0
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Gerar dados de exemplo realistas
    const seedData = generateSeedData();
    console.log(`🌱 Gerando ${seedData.length} registros de exemplo...`);

    // Inserir dados em lotes
    const batchSize = 50;
    let insertedCount = 0;

    for (let i = 0; i < seedData.length; i += batchSize) {
      const batch = seedData.slice(i, i + batchSize);
      
      for (const run of batch) {
        try {
          const efficiency = run.luck > 0 ? run.tokens / run.luck : 0;
          
          await env.DB.prepare(`
            INSERT INTO feed_runs (
              id, user_email, map_name, luck, tokens, efficiency, 
              created_at, level, tier, charge, player_name
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            `seed_${run.timestamp}_${Math.random().toString(36).substr(2, 6)}`,
            null, // user_email
            run.mapSize,
            run.luck,
            run.tokens,
            efficiency,
            run.timestamp,
            run.level,
            run.tier,
            run.charge,
            run.playerName
          ).run();
          
          insertedCount++;
        } catch (error) {
          console.error('Erro ao inserir run:', error);
        }
      }
    }

    // Verificar resultado
    const finalCount = await env.DB.prepare(`
      SELECT COUNT(*) as total FROM feed_runs
    `).first() as { total: number } | null;

    console.log(`✅ Seed concluído: ${insertedCount} registros inseridos`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Feed data seeded successfully',
      data: {
        inserted: insertedCount,
        total: finalCount?.total || 0,
        sampleData: seedData.slice(0, 5) // Mostrar primeiros 5 registros
      }
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('❌ Erro ao fazer seed do feed:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to seed feed data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

function generateSeedData(): SeedRun[] {
  const maps = ['Small Map', 'Medium Map', 'Large Map', 'XLarge Map'];
  const levels = ['I', 'II', 'III', 'IV', 'V'];
  const tiers = ['I', 'II', 'III'];
  const players = [
    'Alex', 'Bruno', 'Carlos', 'Diego', 'Eduardo', 'Felipe', 'Gabriel', 'Henrique',
    'Igor', 'João', 'Kleber', 'Lucas', 'Marcos', 'Nelson', 'Otávio', 'Pedro',
    'Rafael', 'Sérgio', 'Thiago', 'Ulisses', 'Vitor', 'Wagner', 'Xavier', 'Yuri', 'Zeca'
  ];

  const runs: SeedRun[] = [];
  const now = Date.now();
  
  // Gerar dados dos últimos 30 dias
  for (let i = 0; i < 200; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const hoursAgo = Math.floor(Math.random() * 24);
    const minutesAgo = Math.floor(Math.random() * 60);
    
    const timestamp = now - (daysAgo * 24 * 60 * 60 * 1000) - (hoursAgo * 60 * 60 * 1000) - (minutesAgo * 60 * 1000);
    
    const mapSize = maps[Math.floor(Math.random() * maps.length)];
    const level = levels[Math.floor(Math.random() * levels.length)];
    const tier = tiers[Math.floor(Math.random() * tiers.length)];
    const playerName = players[Math.floor(Math.random() * players.length)];
    
    // Luck e tokens baseados no mapa
    let luck, tokens;
    switch (mapSize) {
      case 'Small Map':
        luck = 600 + Math.floor(Math.random() * 400);
        tokens = Math.floor(luck * (0.12 + Math.random() * 0.08));
        break;
      case 'Medium Map':
        luck = 1200 + Math.floor(Math.random() * 600);
        tokens = Math.floor(luck * (0.13 + Math.random() * 0.09));
        break;
      case 'Large Map':
        luck = 2000 + Math.floor(Math.random() * 800);
        tokens = Math.floor(luck * (0.15 + Math.random() * 0.10));
        break;
      case 'XLarge Map':
        luck = 3200 + Math.floor(Math.random() * 1200);
        tokens = Math.floor(luck * (0.16 + Math.random() * 0.12));
        break;
      default:
        luck = 1000;
        tokens = 150;
    }
    
    const charge = Math.floor(Math.random() * 20) + 3; // 3-22
    
    runs.push({
      mapSize,
      luck,
      tokens,
      level,
      tier,
      charge,
      playerName,
      timestamp
    });
  }
  
  // Ordenar por timestamp (mais recente primeiro)
  return runs.sort((a, b) => b.timestamp - a.timestamp);
}