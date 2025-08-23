import { addSecurityHeaders } from '../../_lib/security';

interface Env {
  DB: D1Database;
}

export async function onRequestPost({ env, request }: { env: Env; request: Request }) {
  try {
    console.log('💾 BACKUP DATABASE: Iniciando backup...');

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

    console.log('✅ Admin autorizado para backup:', session.email);

    // Criar tabela de backup se não existir
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS backup_logs (
        id TEXT PRIMARY KEY,
        timestamp INTEGER NOT NULL,
        backup_type TEXT NOT NULL,
        records_count INTEGER NOT NULL,
        status TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )
    `).run();

    const backupId = `backup_${Date.now()}`;
    const timestamp = Date.now();

    // Contar registros atuais
    const metricsCount = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM user_map_metrics
    `).first() as { count: number } | null;

    const usersCount = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM users
    `).first() as { count: number } | null;

    const totalRecords = (metricsCount?.count || 0) + (usersCount?.count || 0);

    console.log('📊 Registros para backup:', {
      metrics: metricsCount?.count || 0,
      users: usersCount?.count || 0,
      total: totalRecords
    });

    // Criar tabela de backup de métricas
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS backup_user_map_metrics_${backupId} AS 
      SELECT * FROM user_map_metrics
    `).run();

    // Criar tabela de backup de usuários
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS backup_users_${backupId} AS 
      SELECT * FROM users
    `).run();

    // Registrar o backup
    await env.DB.prepare(`
      INSERT INTO backup_logs (
        id, timestamp, backup_type, records_count, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      backupId,
      timestamp,
      'full_backup',
      totalRecords,
      'completed',
      Date.now()
    ).run();

    console.log('✅ Backup concluído:', backupId);

    // Verificar se o backup foi criado corretamente
    const backupMetricsCount = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM backup_user_map_metrics_${backupId}
    `).first() as { count: number } | null;

    const backupUsersCount = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM backup_users_${backupId}
    `).first() as { count: number } | null;

    const response = Response.json({
      success: true,
      backupId,
      timestamp: new Date(timestamp).toLocaleString('pt-BR'),
      recordsBackup: {
        metrics: backupMetricsCount?.count || 0,
        users: backupUsersCount?.count || 0,
        total: (backupMetricsCount?.count || 0) + (backupUsersCount?.count || 0)
      },
      originalRecords: {
        metrics: metricsCount?.count || 0,
        users: usersCount?.count || 0,
        total: totalRecords
      }
    });
    
    return addSecurityHeaders(response);

  } catch (error) {
    console.error('❌ Erro no backup:', error);
    
    // Tentar registrar o erro no log
    try {
      if (env.DB) {
        await env.DB.prepare(`
          INSERT INTO backup_logs (
            id, timestamp, backup_type, records_count, status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
          `backup_error_${Date.now()}`,
          Date.now(),
          'full_backup',
          0,
          `error: ${error.message}`,
          Date.now()
        ).run();
      }
    } catch (logError) {
      console.error('❌ Erro ao registrar log de erro:', logError);
    }

    const response = Response.json({ 
      success: false,
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
    return addSecurityHeaders(response);
  }
}