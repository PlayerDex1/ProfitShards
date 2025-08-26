import { addSecurityHeaders } from '../../_lib/security';

interface Env {
  DB: D1Database;
}

export async function onRequestPost({ env, request }: { env: Env; request: Request }) {
  try {
    console.log('🗑️ CLEAR FEED: Iniciando limpeza do feed...');

    if (!env.DB) {
      const response = Response.json({ 
        success: false,
        error: 'Database not available' 
      }, { status: 500 });
      return addSecurityHeaders(response);
    }

    // Verificar autenticação (apenas admins podem limpar)
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

    if (!session) {
      const response = Response.json({ 
        success: false,
        error: 'Invalid session' 
      }, { status: 401 });
      return addSecurityHeaders(response);
    }

    // ⚠️ VERIFICAÇÃO ADMIN: Apenas emails específicos podem limpar
    const adminEmails = [
      'profitshards@gmail.com',
      // Adicionar outros emails admin conforme necessário
    ];

    if (!adminEmails.includes(session.email)) {
      const response = Response.json({ 
        success: false,
        error: 'Admin access required' 
      }, { status: 403 });
      return addSecurityHeaders(response);
    }

    // Contar registros antes da limpeza
    const countBefore = await env.DB.prepare(`
      SELECT COUNT(*) as total FROM feed_runs
    `).first() as { total: number } | null;

    console.log(`🗑️ Registros no feed antes da limpeza: ${countBefore?.total || 0}`);

    // LIMPEZA TOTAL da tabela feed_runs
    const deleteResult = await env.DB.prepare(`
      DELETE FROM feed_runs
    `).run();

    console.log('🗑️ Resultado da limpeza:', deleteResult);

    // Contar registros após a limpeza
    const countAfter = await env.DB.prepare(`
      SELECT COUNT(*) as total FROM feed_runs
    `).first() as { total: number } | null;

    if (!deleteResult.success) {
      const response = Response.json({ 
        success: false,
        error: 'Erro ao limpar feed' 
      }, { status: 500 });
      return addSecurityHeaders(response);
    }

    const response = Response.json({
      success: true,
      message: 'Feed limpo com sucesso',
      admin: session.email,
      stats: {
        recordsBefore: countBefore?.total || 0,
        recordsAfter: countAfter?.total || 0,
        recordsDeleted: (countBefore?.total || 0) - (countAfter?.total || 0)
      },
      timestamp: new Date().toISOString()
    });
    
    return addSecurityHeaders(response);

  } catch (error) {
    console.error('❌ Erro ao limpar feed:', error);
    const response = Response.json({ 
      success: false,
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
    return addSecurityHeaders(response);
  }
}