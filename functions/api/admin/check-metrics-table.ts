import { addSecurityHeaders } from '../../_lib/security';

interface Env {
  DB: D1Database;
}

export async function onRequestGet({ env, request }: { env: Env; request: Request }) {
  try {
    console.log('🔍 Verificando status da tabela map_drop_metrics...');

    // Verificar se a tabela existe
    const tableExists = await env.DB.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='map_drop_metrics'
    `).first();

    console.log('📊 Tabela existe:', !!tableExists);

    let tableInfo = {
      exists: !!tableExists,
      totalRecords: 0,
      recentRecords: [],
      lastInsert: null
    };

    if (tableExists) {
      // Contar registros
      const count = await env.DB.prepare(`SELECT COUNT(*) as count FROM map_drop_metrics`).first() as { count: number };
      tableInfo.totalRecords = count?.count || 0;

      // Buscar últimos 5 registros
      const recent = await env.DB.prepare(`
        SELECT user_hash, map_name, luck_value, tokens_dropped, created_at 
        FROM map_drop_metrics 
        ORDER BY created_at DESC 
        LIMIT 5
      `).all();

      tableInfo.recentRecords = recent.results || [];

      // Último registro inserido
      if (tableInfo.recentRecords.length > 0) {
        const lastRecord = tableInfo.recentRecords[0] as any;
        tableInfo.lastInsert = new Date(lastRecord.created_at).toLocaleString('pt-BR');
      }
    }

    console.log('📊 Status da tabela:', tableInfo);

    const response = Response.json({
      success: true,
      table: tableInfo,
      timestamp: new Date().toLocaleString('pt-BR')
    });
    
    return addSecurityHeaders(response);

  } catch (error) {
    console.error('❌ Erro ao verificar tabela:', error);
    const response = Response.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 });
    return addSecurityHeaders(response);
  }
}