interface Env {
  DB: D1Database;
}

export async function onRequestPost({ env }: { env: Env }) {
  try {
    console.log('🔧 INSERINDO DADOS DE TESTE...');

    if (!env.DB) {
      return new Response(JSON.stringify({
        error: 'Database not available'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const now = Date.now();
    const testData = [
      {
        id: 'test-run-1',
        user_id: 'test-user-1',
        map_name: 'medium',
        tokens_earned: 250,
        drop_data: JSON.stringify({
          luck: 1500,
          efficiency: 166.7,
          gems_used: 5
        }),
        created_at: now - (2 * 60 * 60 * 1000) // 2 horas atrás
      },
      {
        id: 'test-run-2',
        user_id: 'test-user-2', 
        map_name: 'large',
        tokens_earned: 450,
        drop_data: JSON.stringify({
          luck: 2200,
          efficiency: 204.5,
          gems_used: 8
        }),
        created_at: now - (5 * 60 * 60 * 1000) // 5 horas atrás
      },
      {
        id: 'test-run-3',
        user_id: 'test-user-3',
        map_name: 'small',
        tokens_earned: 120,
        drop_data: JSON.stringify({
          luck: 800,
          efficiency: 150.0,
          gems_used: 3
        }),
        created_at: now - (1 * 60 * 60 * 1000) // 1 hora atrás
      },
      {
        id: 'test-run-4',
        user_id: 'test-user-4',
        map_name: 'xlarge',
        tokens_earned: 680,
        drop_data: JSON.stringify({
          luck: 3200,
          efficiency: 212.5,
          gems_used: 12
        }),
        created_at: now - (30 * 60 * 1000) // 30 min atrás
      },
      {
        id: 'test-run-5',
        user_id: 'test-user-5',
        map_name: 'medium',
        tokens_earned: 195,
        drop_data: JSON.stringify({
          luck: 1200,
          efficiency: 162.5,
          gems_used: 4
        }),
        created_at: now - (15 * 60 * 1000) // 15 min atrás
      }
    ];

    console.log('📊 Inserindo', testData.length, 'registros de teste...');

    let insertedCount = 0;
    for (const data of testData) {
      try {
        await env.DB.prepare(`
          INSERT INTO user_map_drops (id, user_id, map_name, tokens_earned, drop_data, created_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
          data.id,
          data.user_id,
          data.map_name,
          data.tokens_earned,
          data.drop_data,
          data.created_at
        ).run();
        
        insertedCount++;
        console.log(`✅ Inserido: ${data.id} - ${data.map_name} - ${data.tokens_earned} tokens`);
      } catch (insertError) {
        console.log(`❌ Erro inserindo ${data.id}:`, insertError.message);
      }
    }

    // Verificar se dados foram inseridos
    const countResult = await env.DB.prepare('SELECT COUNT(*) as total FROM user_map_drops').first();
    console.log('📊 Total após inserção:', countResult?.total);

    return new Response(JSON.stringify({
      success: true,
      message: `${insertedCount} registros inseridos com sucesso`,
      total_records_now: countResult?.total || 0,
      inserted_data: testData.map(d => ({
        id: d.id,
        map_name: d.map_name,
        tokens_earned: d.tokens_earned,
        created_at_iso: new Date(d.created_at).toISOString()
      }))
    }, null, 2), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('❌ Erro inserindo dados de teste:', error);
    return new Response(JSON.stringify({
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}