import { addSecurityHeaders } from '../../_lib/security';

interface Env {
  DB: D1Database;
}

export async function onRequestGet({ env, request }: { env: Env; request: Request }) {
  try {
    console.log('📊 EXPORT DATA: Iniciando exportação...');

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

    // Obter formato da query string
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'csv';

    console.log(`📊 Exportando dados em formato: ${format}`);

    // Buscar todos os dados
    const allMetrics = await env.DB.prepare(`
      SELECT * FROM user_map_metrics 
      ORDER BY created_at DESC
    `).all();

    const users = await env.DB.prepare(`
      SELECT id, email, created_at FROM users
    `).all();

    const sessions = await env.DB.prepare(`
      SELECT user_id, created_at, expires_at FROM sessions WHERE expires_at > ?
    `).bind(Date.now()).all();

    const exportData = {
      exportedAt: new Date().toISOString(),
      totalMetrics: allMetrics.results?.length || 0,
      totalUsers: users.results?.length || 0,
      activeSessions: sessions.results?.length || 0,
      metrics: allMetrics.results || [],
      users: users.results || [],
      sessions: sessions.results || []
    };

    console.log('📊 Dados coletados:', {
      metrics: exportData.totalMetrics,
      users: exportData.totalUsers,
      sessions: exportData.activeSessions
    });

    if (format === 'json') {
      const response = new Response(JSON.stringify(exportData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="metrics-export-${new Date().toISOString().split('T')[0]}.json"`
        }
      });
      return addSecurityHeaders(response);
    }

    // Formato CSV
    let csvContent = 'EXPORT_TYPE,TIMESTAMP,USER_EMAIL,MAP_SIZE,LUCK_VALUE,TOKENS_DROPPED,LOADS,SESSION_DATE\n';
    
    if (allMetrics.results) {
      for (const metric of allMetrics.results) {
        csvContent += `METRIC,${metric.timestamp},${metric.user_email},${metric.map_size},${metric.luck_value},${metric.tokens_dropped},${metric.loads},${metric.session_date}\n`;
      }
    }

    const response = new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="metrics-export-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
    
    return addSecurityHeaders(response);

  } catch (error) {
    console.error('❌ Erro na exportação:', error);
    const response = Response.json({ 
      success: false,
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
    return addSecurityHeaders(response);
  }
}