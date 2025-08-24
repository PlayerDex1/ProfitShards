interface Env {
  DB: D1Database;
}

export async function onRequestPost(context: { env: Env; request: Request }) {
  try {
    console.log('🧪 TEST SAVE: Request recebido');
    
    const body = await request.json();
    console.log('📦 Dados recebidos:', body);
    
    // Verificar se DB existe
    if (!context.env.DB) {
      console.log('❌ DB não disponível');
      return new Response(JSON.stringify({ 
        success: false,
        error: 'No DB' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Tentar inserir dados de teste
    const testData = {
      id: `test_${Date.now()}`,
      user_id: 'test-user-123',
      map_name: body.mapSize || 'medium',
      map_size: body.mapSize || 'medium', 
      tokens_earned: body.tokensDropped || 100,
      efficiency_rating: 12.5,
      drop_data: JSON.stringify({
        luck: body.luck || 1000,
        loads: body.loads || 8
      }),
      created_at: Date.now()
    };

    console.log('💾 Tentando inserir:', testData);

    await context.env.DB.prepare(`
      INSERT INTO user_map_drops (
        id, user_id, map_name, map_size, tokens_earned, 
        efficiency_rating, drop_data, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      testData.id,
      testData.user_id,
      testData.map_name,
      testData.map_size,
      testData.tokens_earned,
      testData.efficiency_rating,
      testData.drop_data,
      testData.created_at
    ).run();

    console.log('✅ Inserção bem sucedida');

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Test data inserted',
      data: testData
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestGet(context: { env: Env; request: Request }) {
  return new Response(JSON.stringify({ 
    message: 'Use POST para testar salvamento',
    example: {
      mapSize: 'medium',
      tokensDropped: 100,
      luck: 1000,
      loads: 8
    }
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}