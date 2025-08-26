interface Env {
  DB: D1Database;
}

export async function onRequestGet({ env }: { env: Env }) {
  try {
    console.log('🔍 DEBUG: Verificando dados do feed...');

    if (!env.DB) {
      return new Response(JSON.stringify({
        error: 'Database not available'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 1. Contar total de registros
    const countResult = await env.DB.prepare('SELECT COUNT(*) as total FROM user_map_drops').first();
    console.log('📊 Total de registros:', countResult);

    // 2. Buscar registros mais recentes
    const recentResult = await env.DB.prepare(`
      SELECT id, user_id, map_name, tokens_earned, created_at 
      FROM user_map_drops 
      ORDER BY created_at DESC 
      LIMIT 10
    `).all();
    console.log('📋 Registros recentes:', recentResult.results?.length || 0);

    // 3. Buscar registros das últimas 24h
    const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
    const recent24hResult = await env.DB.prepare(`
      SELECT id, user_id, map_name, tokens_earned, created_at 
      FROM user_map_drops 
      WHERE created_at > ?
      ORDER BY created_at DESC 
      LIMIT 10
    `).bind(twentyFourHoursAgo).all();
    console.log('⏰ Registros últimas 24h:', recent24hResult.results?.length || 0);

    // 4. Verificar estrutura da tabela
    const tableInfoResult = await env.DB.prepare('PRAGMA table_info(user_map_drops)').all();
    console.log('🏗️ Estrutura da tabela:', tableInfoResult.results);

    const debugInfo = {
      total_records: countResult?.total || 0,
      recent_records: recentResult.results?.map(r => ({
        id: r.id,
        user_id: r.user_id,
        map_name: r.map_name,
        tokens_earned: r.tokens_earned,
        created_at: r.created_at,
        created_at_iso: new Date(r.created_at).toISOString()
      })) || [],
      recent_24h_records: recent24hResult.results?.map(r => ({
        id: r.id,
        user_id: r.user_id,
        map_name: r.map_name,
        tokens_earned: r.tokens_earned,
        created_at: r.created_at,
        created_at_iso: new Date(r.created_at).toISOString()
      })) || [],
      table_structure: tableInfoResult.results || [],
      timestamp_filter: {
        twenty_four_hours_ago: twentyFourHoursAgo,
        twenty_four_hours_ago_iso: new Date(twentyFourHoursAgo).toISOString(),
        now: Date.now(),
        now_iso: new Date().toISOString()
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
    console.error('❌ Erro no debug:', error);
    return new Response(JSON.stringify({
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}