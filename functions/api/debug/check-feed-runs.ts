interface Env {
  DB: D1Database;
}

export async function onRequestGet({ env }: { env: Env }) {
  try {
    console.log('🔍 DEBUG: Verificando tabela feed_runs...');

    if (!env.DB) {
      return new Response(JSON.stringify({
        error: 'Database not available'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 1. Verificar se a tabela existe
    const tableExists = await env.DB.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='feed_runs'
    `).first();

    // 2. Contar total de registros
    let countResult = null;
    let recentResult = null;
    let tableStructure = null;

    if (tableExists) {
      countResult = await env.DB.prepare('SELECT COUNT(*) as total FROM feed_runs').first();
      
      // 3. Buscar registros mais recentes
      recentResult = await env.DB.prepare(`
        SELECT * FROM feed_runs 
        ORDER BY created_at DESC 
        LIMIT 10
      `).all();

      // 4. Verificar estrutura da tabela
      tableStructure = await env.DB.prepare('PRAGMA table_info(feed_runs)').all();
    }

    const debugInfo = {
      table_exists: !!tableExists,
      total_records: countResult?.total || 0,
      recent_records: recentResult?.results?.map(r => ({
        id: r.id,
        map_name: r.map_name,
        luck: r.luck,
        tokens: r.tokens,
        player_name: r.player_name,
        created_at: r.created_at,
        created_at_iso: new Date(r.created_at).toISOString()
      })) || [],
      table_structure: tableStructure?.results || [],
      timestamp_info: {
        now: Date.now(),
        now_iso: new Date().toISOString(),
        twenty_four_hours_ago: Date.now() - (24 * 60 * 60 * 1000),
        twenty_four_hours_ago_iso: new Date(Date.now() - (24 * 60 * 60 * 1000)).toISOString()
      }
    };

    return new Response(JSON.stringify(debugInfo, null, 2), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('❌ Erro no debug feed_runs:', error);
    return new Response(JSON.stringify({
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}