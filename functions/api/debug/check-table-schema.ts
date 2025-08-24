interface Env {
  DB: D1Database;
}

export async function onRequestGet(context: { env: Env; request: Request }) {
  try {
    const { env } = context;
    
    if (!env.DB) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Database not available' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar schema da tabela user_map_drops
    const schema = await env.DB.prepare(`
      PRAGMA table_info(user_map_drops)
    `).all();

    console.log('📋 Schema user_map_drops:', schema.results);

    // Verificar se há outras tabelas relacionadas
    const tables = await env.DB.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name LIKE '%map%'
    `).all();

    console.log('🗂️ Tabelas com "map":', tables.results);

    // Verificar indices
    const indexes = await env.DB.prepare(`
      PRAGMA index_list(user_map_drops)
    `).all();

    console.log('🔍 Indices user_map_drops:', indexes.results);

    return new Response(JSON.stringify({ 
      success: true,
      schema: schema.results,
      relatedTables: tables.results,
      indexes: indexes.results
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erro verificando schema:', error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}