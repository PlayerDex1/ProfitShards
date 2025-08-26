interface Env {
  DB: D1Database;
  KV?: KVNamespace;
}

export async function onRequestPost({ env }: { env: Env }) {
  try {
    console.log('🗑️ ADMIN: Resetando todas as estatísticas...');

    // 1. LIMPAR TABELAS DE DADOS
    const tablesToClear = [
      'feed_runs',
      'user_map_drops', 
      'user_calculations',
      'user_activity'
    ];

    for (const table of tablesToClear) {
      try {
        await env.DB.prepare(`DELETE FROM ${table}`).run();
        console.log(`✅ Tabela ${table} limpa`);
      } catch (error) {
        console.log(`⚠️ Erro ao limpar ${table}:`, error);
        // Continue even if table doesn't exist
      }
    }

    // 2. LIMPAR CACHE KV
    if (env.KV) {
      try {
        const cacheKeys = [
          'community_stats_cache',
          'activity_stream_cache',
          'map_analytics_cache',
          'data_analysis_cache'
        ];

        for (const key of cacheKeys) {
          await env.KV.delete(key);
          console.log(`🧹 Cache ${key} limpo`);
        }
      } catch (error) {
        console.log('⚠️ Erro ao limpar cache:', error);
      }
    }

    console.log('✅ Reset completo realizado');

    return new Response(JSON.stringify({
      success: true,
      message: 'Todas as estatísticas foram resetadas',
      clearedTables: tablesToClear,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('❌ Erro no reset:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// Handle preflight requests
export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}