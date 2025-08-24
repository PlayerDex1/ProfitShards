interface Env {
  DB: D1Database;
}

export async function onRequestGet(context: { env: Env; request: Request }) {
  try {
    const { env } = context;
    
    console.log('🔍 DEBUG: Verificando dados para feed...');
    
    if (!env.DB) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Database not available' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar se tabela existe
    const tableCheck = await env.DB.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='user_map_drops'
    `).first();

    console.log('📋 Tabela user_map_drops existe?', !!tableCheck);

    // Contar total de registros
    const countResult = await env.DB.prepare(`
      SELECT COUNT(*) as total FROM user_map_drops
    `).first();

    const totalRecords = countResult?.total || 0;
    console.log(`📊 Total de registros: ${totalRecords}`);

    // Buscar últimos 5 registros
    const recentRecords = await env.DB.prepare(`
      SELECT * FROM user_map_drops 
      ORDER BY created_at DESC 
      LIMIT 5
    `).all();

    console.log(`🔍 Últimos registros:`, recentRecords.results);

    // Buscar registros das últimas 24 horas
    const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
    const recentData = await env.DB.prepare(`
      SELECT * FROM user_map_drops 
      WHERE created_at > ? 
      ORDER BY created_at DESC
    `).bind(twentyFourHoursAgo).all();

    console.log(`⏰ Registros das últimas 24h: ${recentData.results?.length || 0}`);

    return new Response(JSON.stringify({ 
      success: true,
      debug: {
        tableExists: !!tableCheck,
        totalRecords: totalRecords,
        recentRecords: recentRecords.results || [],
        last24Hours: recentData.results || [],
        last24HoursCount: recentData.results?.length || 0,
        timestampNow: Date.now(),
        timestampLimit: twentyFourHoursAgo,
        timestampLimitDate: new Date(twentyFourHoursAgo).toISOString()
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erro verificando dados:', error);
    
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