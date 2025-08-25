interface Env {
  DB: D1Database;
}

export async function onRequestPost(context: { env: Env; request: Request }) {
  try {
    const { env } = context;
    
    console.log('🏗️ CREATE TABLE: Iniciando criação da tabela user_map_drops...');
    
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

    // Verificar se tabela já existe
    const tableExists = await env.DB.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='user_map_drops'
    `).first();

    if (tableExists) {
      console.log('⚠️ Tabela user_map_drops já existe');
      return new Response(JSON.stringify({ 
        success: true,
        message: 'Table already exists',
        existed: true
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('🏗️ Criando tabela user_map_drops...');

    // Criar tabela com schema completo
    await env.DB.prepare(`
      CREATE TABLE user_map_drops (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        map_name TEXT NOT NULL,
        map_size TEXT, -- Campo adicional para compatibilidade com feed
        drop_data TEXT NOT NULL, -- JSON with drop information
        tokens_earned INTEGER,
        time_spent INTEGER, -- in minutes  
        efficiency_rating REAL,
        created_at INTEGER NOT NULL
      )
    `).run();

    console.log('✅ Tabela user_map_drops criada');

    // Criar índices
    console.log('🔍 Criando índices...');
    
    await env.DB.prepare(`
      CREATE INDEX idx_mapdrops_user_id ON user_map_drops(user_id)
    `).run();

    await env.DB.prepare(`
      CREATE INDEX idx_mapdrops_map ON user_map_drops(map_name)
    `).run();

    await env.DB.prepare(`
      CREATE INDEX idx_mapdrops_created ON user_map_drops(created_at)
    `).run();

    console.log('✅ Índices criados');

    // Inserir dados de teste para verificar
    console.log('🧪 Inserindo dados de teste...');
    
    const testData = [
      {
        id: `test_${Date.now()}_1`,
        user_id: 'test-user-1',
        map_name: 'medium',
        map_size: 'medium',
        tokens_earned: 150,
        efficiency_rating: 18.75,
        drop_data: JSON.stringify({ luck: 2500, loads: 8, energyCost: 8 }),
        time_spent: 0,
        created_at: Date.now() - 10 * 60 * 1000 // 10 min atrás
      },
      {
        id: `test_${Date.now()}_2`,
        user_id: 'test-user-2',
        map_name: 'large',
        map_size: 'large',
        tokens_earned: 320,
        efficiency_rating: 20.0,
        drop_data: JSON.stringify({ luck: 4200, loads: 16, energyCost: 16 }),
        time_spent: 0,
        created_at: Date.now() - 5 * 60 * 1000 // 5 min atrás
      }
    ];

    for (const data of testData) {
      await env.DB.prepare(`
        INSERT INTO user_map_drops (
          id, user_id, map_name, map_size, drop_data, tokens_earned, 
          time_spent, efficiency_rating, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        data.id,
        data.user_id,
        data.map_name,
        data.map_size,
        data.drop_data,
        data.tokens_earned,
        data.time_spent,
        data.efficiency_rating,
        data.created_at
      ).run();
    }

    console.log('✅ Dados de teste inseridos');

    // Verificar resultado
    const count = await env.DB.prepare(`
      SELECT COUNT(*) as total FROM user_map_drops
    `).first();

    console.log(`📊 Total de registros na tabela: ${count?.total}`);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Table user_map_drops created successfully with test data',
      totalRecords: count?.total,
      testData: testData.map(d => ({ id: d.id, map_name: d.map_name, tokens_earned: d.tokens_earned }))
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erro criando tabela:', error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Failed to create table',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestGet() {
  return new Response(JSON.stringify({ 
    message: 'Use POST to create user_map_drops table',
    note: 'This will create the table with proper schema and test data'
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}