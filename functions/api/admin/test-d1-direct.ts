import { addSecurityHeaders } from '../../_lib/security';

interface Env {
  DB: D1Database;
}

export async function onRequestPost({ env, request }: { env: Env; request: Request }) {
  try {
    console.log('🧪 TEST D1 DIRECT: Iniciando teste direto...');

    // Verificar se DB está disponível
    if (!env.DB) {
      console.log('❌ D1 Database não disponível');
      const response = Response.json({ 
        success: false,
        error: 'Database not available' 
      }, { status: 500 });
      return addSecurityHeaders(response);
    }

    console.log('✅ D1 Database disponível');

    // Criar tabela se não existir
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS user_map_metrics (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        user_email TEXT NOT NULL,
        map_size TEXT NOT NULL,
        luck_value REAL NOT NULL,
        tokens_dropped REAL NOT NULL,
        loads INTEGER NOT NULL,
        timestamp INTEGER NOT NULL,
        session_date TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )
    `).run();

    console.log('✅ Tabela user_map_metrics verificada/criada');

    // Dados de teste para diferentes usuários
    const testData = [
      {
        id: 'test_holdboy_' + Date.now(),
        user_id: 'user_holdboy',
        user_email: 'holdboy01@gmail.com',
        map_size: 'xlarge',
        luck_value: 5500,
        tokens_dropped: 420,
        loads: 24,
        timestamp: Date.now(),
        session_date: '2025-08-23',
        created_at: Date.now()
      },
      {
        id: 'test_catdrizi_' + Date.now(),
        user_id: 'user_catdrizi',
        user_email: 'catdrizi@gmail.com',
        map_size: 'large',
        luck_value: 4200,
        tokens_dropped: 350,
        loads: 16,
        timestamp: Date.now() + 1000,
        session_date: '2025-08-23',
        created_at: Date.now() + 1000
      }
    ];

    console.log('📊 Inserindo dados de teste:', testData);

    // Inserir dados de teste
    for (const data of testData) {
      const insertResult = await env.DB.prepare(`
        INSERT OR REPLACE INTO user_map_metrics (
          id, user_id, user_email, map_size, luck_value, tokens_dropped, 
          loads, timestamp, session_date, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        data.id, data.user_id, data.user_email, data.map_size,
        data.luck_value, data.tokens_dropped, data.loads,
        data.timestamp, data.session_date, data.created_at
      ).run();

      console.log(`✅ Inserido ${data.user_email}:`, insertResult);
    }

    // Verificar se os dados foram salvos
    const allData = await env.DB.prepare(`
      SELECT * FROM user_map_metrics ORDER BY created_at DESC LIMIT 10
    `).all();

    console.log('📊 Dados na tabela após inserção:', allData.results);

    // Contar registros por usuário
    const countByUser = await env.DB.prepare(`
      SELECT user_email, COUNT(*) as count 
      FROM user_map_metrics 
      GROUP BY user_email
    `).all();

    console.log('📊 Contagem por usuário:', countByUser.results);

    const response = Response.json({
      success: true,
      message: 'Teste D1 concluído',
      inserted: testData.length,
      totalRecords: allData.results?.length || 0,
      recordsByUser: countByUser.results || [],
      sampleData: allData.results?.slice(0, 5) || []
    });
    
    return addSecurityHeaders(response);

  } catch (error) {
    console.error('❌ Erro no teste D1:', error);
    const response = Response.json({ 
      success: false,
      error: 'Internal server error',
      message: error.message,
      stack: error.stack
    }, { status: 500 });
    return addSecurityHeaders(response);
  }
}