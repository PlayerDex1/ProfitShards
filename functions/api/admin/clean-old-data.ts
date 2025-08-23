import { addSecurityHeaders } from '../../_lib/security';

interface Env {
  DB: D1Database;
}

export async function onRequestPost({ env, request }: { env: Env; request: Request }) {
  try {
    console.log('🧹 CLEAN OLD DATA: Iniciando limpeza...');

    // Verificar se DB está disponível
    if (!env.DB) {
      const response = Response.json({ 
        success: false,
        error: 'Database not available' 
      }, { status: 500 });
      return addSecurityHeaders(response);
    }

    // Verificar autenticação
    const cookieHeader = request.headers.get('Cookie');
    const sessionCookie = cookieHeader
      ?.split(';')
      .find(c => c.trim().startsWith('ps_session='))
      ?.split('=')[1];

    if (!sessionCookie) {
      const response = Response.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 });
      return addSecurityHeaders(response);
    }

    // Buscar usuário pela sessão
    const session = await env.DB.prepare(`
      SELECT u.id, u.email 
      FROM sessions s 
      JOIN users u ON s.user_id = u.id 
      WHERE s.session_id = ? AND s.expires_at > ?
    `).bind(sessionCookie, Date.now()).first() as { id: string; email: string } | null;

    if (!session || session.email !== 'holdboy01@gmail.com') {
      const response = Response.json({ 
        success: false,
        error: 'Access denied' 
      }, { status: 403 });
      return addSecurityHeaders(response);
    }

    console.log('✅ Admin autorizado para limpeza:', session.email);

    // Calcular data limite (90 dias atrás)
    const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
    const limitDate = new Date(ninetyDaysAgo);

    console.log('📅 Removendo dados anteriores a:', limitDate.toLocaleString('pt-BR'));

    // Contar registros antes da limpeza
    const totalBefore = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM user_map_metrics
    `).first() as { count: number } | null;

    const oldRecords = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM user_map_metrics WHERE created_at < ?
    `).bind(ninetyDaysAgo).first() as { count: number } | null;

    console.log('📊 Registros encontrados:', {
      total: totalBefore?.count || 0,
      antigos: oldRecords?.count || 0
    });

    // Remover registros antigos
    const deleteResult = await env.DB.prepare(`
      DELETE FROM user_map_metrics WHERE created_at < ?
    `).bind(ninetyDaysAgo).run();

    console.log('🗑️ Resultado da remoção:', deleteResult);

    // Contar registros após limpeza
    const totalAfter = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM user_map_metrics
    `).first() as { count: number } | null;

    // Limpar sessões expiradas também
    const expiredSessions = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM sessions WHERE expires_at < ?
    `).bind(Date.now()).first() as { count: number } | null;

    await env.DB.prepare(`
      DELETE FROM sessions WHERE expires_at < ?
    `).bind(Date.now()).run();

    // Limpar tabelas de backup antigas (mais de 30 dias)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    try {
      // Listar tabelas de backup antigas
      const backupTables = await env.DB.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name LIKE 'backup_%'
      `).all();

      let backupTablesRemoved = 0;
      
      if (backupTables.results) {
        for (const table of backupTables.results) {
          const tableName = (table as any).name;
          // Extrair timestamp do nome da tabela (backup_user_map_metrics_backup_1234567890)
          const match = tableName.match(/backup_(\d+)$/);
          if (match) {
            const backupTimestamp = parseInt(match[1]);
            if (backupTimestamp < thirtyDaysAgo) {
              await env.DB.prepare(`DROP TABLE IF EXISTS ${tableName}`).run();
              backupTablesRemoved++;
              console.log('🗑️ Tabela de backup removida:', tableName);
            }
          }
        }
      }

      console.log(`🗑️ Tabelas de backup removidas: ${backupTablesRemoved}`);
    } catch (backupError) {
      console.log('⚠️ Erro ao limpar backups antigos:', backupError);
    }

    const recordsRemoved = (totalBefore?.count || 0) - (totalAfter?.count || 0);
    const recordsKept = totalAfter?.count || 0;

    console.log('✅ Limpeza concluída:', {
      removidos: recordsRemoved,
      mantidos: recordsKept,
      sessoesExpiradas: expiredSessions?.count || 0
    });

    const response = Response.json({
      success: true,
      recordsRemoved,
      recordsKept,
      expiredSessionsRemoved: expiredSessions?.count || 0,
      cutoffDate: limitDate.toLocaleString('pt-BR'),
      summary: {
        totalBefore: totalBefore?.count || 0,
        totalAfter: totalAfter?.count || 0,
        percentageRemoved: totalBefore?.count ? Math.round((recordsRemoved / totalBefore.count) * 100) : 0
      }
    });
    
    return addSecurityHeaders(response);

  } catch (error) {
    console.error('❌ Erro na limpeza:', error);
    const response = Response.json({ 
      success: false,
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
    return addSecurityHeaders(response);
  }
}