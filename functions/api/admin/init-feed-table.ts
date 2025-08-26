// 🚀 INIT FEED TABLE - Criar tabela feed_runs automaticamente
// Esta API cria a tabela feed_runs se ela não existir

interface Env {
  DB: D1Database;
}

export async function onRequestPost({ env }: { env: Env }) {
  try {
    console.log('🏗️ INIT FEED TABLE: Verificando/criando tabela feed_runs...');

    if (!env.DB) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Database not available' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Criar tabela se não existir
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

    // Criar índices
    await env.DB.prepare(`
      CREATE INDEX IF NOT EXISTS idx_feed_runs_created_at ON feed_runs(created_at DESC)
    `).run();

    // Verificar se tabela foi criada
    const tableCheck = await env.DB.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='feed_runs'
    `).first();

    if (tableCheck) {
      console.log('✅ Tabela feed_runs criada/verificada com sucesso');
      
      // Inserir dados demo se tabela estiver vazia
      const countResult = await env.DB.prepare(`SELECT COUNT(*) as count FROM feed_runs`).first();
      const count = (countResult as any)?.count || 0;
      
      if (count === 0) {
        console.log('📊 Inserindo dados demo...');
        
        const now = Date.now();
        const demoRuns = [
          {
            id: 'demo_1',
            user_email: 'demo@feed.com',
            map_name: 'Medium Map', 
            luck: 1250,
            tokens: 185,
            efficiency: 0.148,
            created_at: now - (3 * 60 * 1000) // 3 min atrás
          },
          {
            id: 'demo_2',
            user_email: 'demo@feed.com',
            map_name: 'Large Map',
            luck: 2100, 
            tokens: 420,
            efficiency: 0.200,
            created_at: now - (8 * 60 * 1000) // 8 min atrás
          },
          {
            id: 'demo_3',
            user_email: 'demo@feed.com',
            map_name: 'XLarge Map',
            luck: 3800,
            tokens: 750,
            efficiency: 0.197,
            created_at: now - (15 * 60 * 1000) // 15 min atrás
          }
        ];

        for (const run of demoRuns) {
          await env.DB.prepare(`
            INSERT OR IGNORE INTO feed_runs (id, user_email, map_name, luck, tokens, efficiency, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).bind(
            run.id,
            run.user_email,
            run.map_name,
            run.luck,
            run.tokens,
            run.efficiency,
            run.created_at
          ).run();
        }
        
        console.log('📊 Dados demo inseridos');
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Feed table initialized successfully',
        tableExists: true,
        totalRuns: count
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } else {
      throw new Error('Failed to create feed_runs table');
    }

  } catch (error) {
    console.error('❌ Erro ao inicializar tabela feed:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to initialize feed table',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}