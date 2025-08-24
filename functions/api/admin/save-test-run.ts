interface Env {
  DB: D1Database;
}

interface TestRunData {
  mapId: string;
  mapName: string;
  level: number;
  tier: number;
  luck: number;
  tokensDropped: number;
  energyCost: number;
  gemCost: number;
  efficiency: number;
  estimatedTokens: number;
  timestamp: number;
  source: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    
    if (!env.DB) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Database not available' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const runData: TestRunData = await request.json();
    
    // Validação básica
    if (!runData.mapId || !runData.tokensDropped || !runData.luck) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing required fields' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Preparar dados para inserção
    const insertData = {
      id: `test-run-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: 'test-user', // Para ambiente de teste
      map_name: runData.mapName,
      drop_data: JSON.stringify({
        mapId: runData.mapId,
        level: runData.level,
        tier: runData.tier,
        luck: runData.luck,
        energyCost: runData.energyCost,
        gemCost: runData.gemCost,
        efficiency: runData.efficiency,
        estimatedTokens: runData.estimatedTokens,
        source: runData.source
      }),
      tokens_earned: runData.tokensDropped,
      time_spent: 0, // Para teste
      efficiency_rating: runData.efficiency,
      created_at: runData.timestamp
    };

    // Inserir no D1
    await env.DB.prepare(`
      INSERT INTO user_map_drops (
        id, user_id, map_name, drop_data, tokens_earned, 
        time_spent, efficiency_rating, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      insertData.id,
      insertData.user_id,
      insertData.map_name,
      insertData.drop_data,
      insertData.tokens_earned,
      insertData.time_spent,
      insertData.efficiency_rating,
      insertData.created_at
    ).run();

    console.log(`✅ Test run saved: ${runData.mapName} - ${runData.tokensDropped} tokens`);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Test run saved successfully',
      data: {
        mapName: runData.mapName,
        tokens: runData.tokensDropped,
        efficiency: runData.efficiency
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error saving test run:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};