import { addSecurityHeaders } from '../../_lib/security';

interface Env {
  DB: D1Database;
}

export async function onRequestPost({ env, request }: { env: Env; request: Request }) {
  try {
    console.log('🧹 RESET TEST DATA: Iniciando limpeza completa...');

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
        error: 'Access denied - Admin only' 
      }, { status: 403 });
      return addSecurityHeaders(response);
    }

    console.log('✅ Admin autorizado para reset completo:', session.email);

    // Contar dados antes da limpeza
    const countsBefore = {
      userMapMetrics: 0,
      expiredSessions: 0,
      backupTables: 0
    };

    try {
      const userMapMetricsCount = await env.DB.prepare(`
        SELECT COUNT(*) as count FROM user_map_metrics
      `).first() as { count: number } | null;
      countsBefore.userMapMetrics = userMapMetricsCount?.count || 0;

      const expiredSessionsCount = await env.DB.prepare(`
        SELECT COUNT(*) as count FROM sessions WHERE expires_at < ?
      `).bind(Date.now()).first() as { count: number } | null;
      countsBefore.expiredSessions = expiredSessionsCount?.count || 0;

      const backupTablesResult = await env.DB.prepare(`
        SELECT COUNT(*) as count FROM sqlite_master 
        WHERE type='table' AND name LIKE 'backup_%'
      `).first() as { count: number } | null;
      countsBefore.backupTables = backupTablesResult?.count || 0;

    } catch (countError) {
      console.log('⚠️ Erro ao contar dados:', countError);
    }

    console.log('📊 Dados antes da limpeza:', countsBefore);

    // 1. REMOVER TODAS as métricas de usuários (dados de teste)
    console.log('🗑️ Removendo TODAS as métricas de usuários...');
    const deleteMetricsResult = await env.DB.prepare(`
      DELETE FROM user_map_metrics
    `).run();

    console.log('✅ Métricas removidas:', deleteMetricsResult);

    // 1.1. REMOVER usuários de teste específicos
    const testEmails = ['holdboy02@gmail.com', 'catdrizi@gmail.com'];
    console.log('🗑️ Removendo usuários de teste específicos:', testEmails);
    
    for (const email of testEmails) {
      try {
        // Remover sessões do usuário de teste
        const userResult = await env.DB.prepare(`
          SELECT id FROM users WHERE email = ?
        `).bind(email).first() as { id: string } | null;

        if (userResult) {
          console.log(`🗑️ Removendo sessões do usuário: ${email}`);
          await env.DB.prepare(`
            DELETE FROM sessions WHERE user_id = ?
          `).bind(userResult.id).run();

          console.log(`🗑️ Removendo usuário de teste: ${email}`);
          await env.DB.prepare(`
            DELETE FROM users WHERE email = ?
          `).bind(email).run();

          console.log(`✅ Usuário ${email} removido completamente`);
        } else {
          console.log(`ℹ️ Usuário ${email} não encontrado`);
        }
      } catch (userError) {
        console.log(`⚠️ Erro ao remover usuário ${email}:`, userError);
      }
    }

    // 2. REMOVER sessões expiradas
    console.log('🗑️ Removendo sessões expiradas...');
    const deleteSessionsResult = await env.DB.prepare(`
      DELETE FROM sessions WHERE expires_at < ?
    `).bind(Date.now()).run();

    console.log('✅ Sessões expiradas removidas:', deleteSessionsResult);

    // 3. REMOVER todas as tabelas de backup
    console.log('🗑️ Removendo tabelas de backup...');
    const backupTables = await env.DB.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name LIKE 'backup_%'
    `).all();

    let backupTablesRemoved = 0;
    if (backupTables.results) {
      for (const table of backupTables.results) {
        const tableName = (table as any).name;
        try {
          await env.DB.prepare(`DROP TABLE IF EXISTS ${tableName}`).run();
          backupTablesRemoved++;
          console.log('✅ Tabela de backup removida:', tableName);
        } catch (dropError) {
          console.log('⚠️ Erro ao remover tabela:', tableName, dropError);
        }
      }
    }

    // 4. REMOVER logs de backup antigos (se existir a tabela)
    try {
      console.log('🗑️ Removendo logs de backup...');
      await env.DB.prepare(`DELETE FROM backup_logs`).run();
      console.log('✅ Logs de backup removidos');
    } catch (logError) {
      console.log('ℹ️ Tabela backup_logs não existe ou já está vazia');
    }

    // 5. RESETAR sequências/contadores (se necessário)
    console.log('🔄 Resetando sistema...');

    const summary = {
      userMapMetricsRemoved: countsBefore.userMapMetrics,
      expiredSessionsRemoved: countsBefore.expiredSessions,
      backupTablesRemoved: backupTablesRemoved,
      testUsersRemoved: testEmails,
      resetTimestamp: new Date().toISOString()
    };

    console.log('✅ LIMPEZA COMPLETA CONCLUÍDA:', summary);

    const response = Response.json({
      success: true,
      message: 'Dashboard completamente limpo! Todos os dados de teste foram removidos.',
      summary: summary,
      details: {
        userMapMetrics: `${summary.userMapMetricsRemoved} registros removidos`,
        expiredSessions: `${summary.expiredSessionsRemoved} sessões removidas`,
        backupTables: `${summary.backupTablesRemoved} tabelas de backup removidas`,
        testUsers: `${summary.testUsersRemoved.join(', ')} removidos`,
        status: 'Dashboard resetado com sucesso - Todos os dados de teste limpos'
      }
    });
    
    return addSecurityHeaders(response);

  } catch (error) {
    console.error('❌ Erro na limpeza completa:', error);
    const response = Response.json({ 
      success: false,
      error: 'Internal server error',
      message: error.message,
      details: 'Erro durante o processo de limpeza'
    }, { status: 500 });
    return addSecurityHeaders(response);
  }
}