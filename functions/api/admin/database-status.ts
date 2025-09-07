// 🔍 VERIFICAR STATUS DO BANCO DE DADOS
// API para diagnosticar problemas no dashboard admin

interface Env {
  DB: D1Database;
}

export async function onRequestGet({ env }: { env: Env }) {
  try {
    console.log('🔍 DATABASE STATUS: Verificando status do banco...');

    if (!env.DB) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Database not available'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 1. Verificar se a tabela feed_runs existe
    const tableExists = await env.DB.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='feed_runs'
    `).first();

    if (!tableExists) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Table feed_runs does not exist',
        tables: await getTableList(env.DB)
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. Verificar estrutura da tabela
    const tableStructure = await env.DB.prepare(`
      PRAGMA table_info(feed_runs)
    `).all();

    // 3. Contar registros na tabela
    const totalRecords = await env.DB.prepare(`
      SELECT COUNT(*) as total FROM feed_runs
    `).first() as { total: number } | null;

    // 4. Verificar registros recentes
    const recentRecords = await env.DB.prepare(`
      SELECT 
        id, 
        map_name, 
        tokens, 
        player_name, 
        created_at,
        datetime(created_at/1000, 'unixepoch') as created_at_readable
      FROM feed_runs 
      ORDER BY created_at DESC 
      LIMIT 10
    `).all();

    // 5. Verificar distribuição por mapa
    const mapDistribution = await env.DB.prepare(`
      SELECT 
        map_name, 
        COUNT(*) as count,
        AVG(tokens) as avg_tokens
      FROM feed_runs 
      GROUP BY map_name 
      ORDER BY count DESC
    `).all();

    // 6. Verificar usuários únicos
    const uniqueUsers = await env.DB.prepare(`
      SELECT 
        COUNT(DISTINCT player_name) as unique_players,
        COUNT(DISTINCT user_email) as unique_emails
      FROM feed_runs
    `).first();

    // 7. Verificar dados das últimas 24h
    const last24h = Date.now() - (24 * 60 * 60 * 1000);
    const recent24h = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM feed_runs WHERE created_at > ?
    `).bind(last24h).first() as { count: number } | null;

    // 8. Verificar dados das últimas 7 dias
    const last7d = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recent7d = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM feed_runs WHERE created_at > ?
    `).bind(last7d).first() as { count: number } | null;

    const status = {
      success: true,
      database: {
        tableExists: !!tableExists,
        tableStructure: tableStructure.results || [],
        totalRecords: totalRecords?.total || 0,
        uniqueUsers: uniqueUsers || { unique_players: 0, unique_emails: 0 }
      },
      data: {
        recentRecords: recentRecords.results || [],
        mapDistribution: mapDistribution.results || [],
        activity: {
          last24h: recent24h?.count || 0,
          last7d: recent7d?.count || 0
        }
      },
      timestamp: new Date().toISOString()
    };

    console.log('📊 Database status:', {
      totalRecords: status.database.totalRecords,
      recent24h: status.data.activity.last24h,
      uniqueUsers: status.database.uniqueUsers
    });

    return new Response(JSON.stringify(status), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('❌ Erro ao verificar status do banco:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to check database status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function getTableList(db: D1Database) {
  try {
    const result = await db.prepare(`
      SELECT name FROM sqlite_master WHERE type='table'
    `).all();
    return result.results?.map((row: any) => row.name) || [];
  } catch (error) {
    console.error('Erro ao listar tabelas:', error);
    return [];
  }
}