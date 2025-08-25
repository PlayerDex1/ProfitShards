interface Env {
  DB: D1Database;
}

export async function onRequestPost(context: { env: Env; request: Request }) {
  try {
    const { env, request } = context;
    
    console.log('🔄 SAVE MAP RUN SIMPLE: Iniciando...');
    
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

    // Parse dos dados
    let runData;
    try {
      runData = await request.json();
      console.log('📦 Dados recebidos:', runData);
    } catch (error) {
      console.log('❌ Erro parsing JSON:', error);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Invalid JSON' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar campos obrigatórios
    if (!runData.mapSize || !runData.tokensDropped) {
      console.log('❌ Dados inválidos:', runData);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Missing required fields' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Usar user_id fixo para bypass de autenticação (só para teste)
    const userId = 'map-user-' + Math.random().toString(36).substr(2, 9);
    const timestamp = runData.timestamp || Date.now();
    const efficiency = runData.loads > 0 ? runData.tokensDropped / runData.loads : 0;

    // Preparar dados para inserção (estrutura mínima)
    const insertData = {
      id: `${userId}_${timestamp}`,
      user_id: userId,
      map_name: runData.mapSize,
      map_size: runData.mapSize,
      tokens_earned: runData.tokensDropped,
      efficiency_rating: efficiency,
      drop_data: JSON.stringify({
        luck: runData.luck || 0,
        loads: runData.loads || 0,
        energyCost: getEnergyFromMapSize(runData.mapSize),
        timestamp: timestamp
      }),
      time_spent: 0,
      created_at: timestamp
    };

    console.log('💾 Tentando INSERT simples:', insertData);

    // Inserir com try/catch específico
    try {
      const insertResult = await env.DB.prepare(`
        INSERT INTO user_map_drops (
          id, user_id, map_name, map_size, drop_data, tokens_earned, 
          time_spent, efficiency_rating, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        insertData.id,
        insertData.user_id,
        insertData.map_name,
        insertData.map_size,
        insertData.drop_data,
        insertData.tokens_earned,
        insertData.time_spent,
        insertData.efficiency_rating,
        insertData.created_at
      ).run();

      console.log('✅ INSERT bem sucedido:', insertResult);

      // Verificar se realmente foi inserido
      const verification = await env.DB.prepare(`
        SELECT * FROM user_map_drops WHERE id = ?
      `).bind(insertData.id).first();

      console.log('🔍 Verificação pós-INSERT:', verification);

      return new Response(JSON.stringify({ 
        success: true,
        message: 'Map run saved successfully (simple)',
        data: insertData,
        insertResult: insertResult,
        verification: verification
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (insertError) {
      console.error('❌ Erro no INSERT:', insertError);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Insert failed',
        details: insertError instanceof Error ? insertError.message : 'Unknown insert error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Helper para energia
function getEnergyFromMapSize(mapSize: string): number {
  const energyMap: Record<string, number> = {
    'small': 4,
    'medium': 8,   
    'large': 16,
    'xlarge': 24
  };
  return energyMap[mapSize] || 8;
}