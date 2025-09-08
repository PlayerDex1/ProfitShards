import { addSecurityHeaders } from '../../_lib/security';

interface Env {
  DB: D1Database;
}

export async function onRequestGet({ env, request }: { env: Env; request: Request }) {
  try {
    console.log('👥 GET USERS: Buscando usuários reais do banco');

    // Verificar se DB existe
    if (!env.DB) {
      const response = Response.json({ 
        error: 'Database not available' 
      }, { status: 500 });
      return addSecurityHeaders(response);
    }

    // Verificar autenticação
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) {
      const response = Response.json({ error: 'Unauthorized' }, { status: 401 });
      return addSecurityHeaders(response);
    }

    const sessionCookie = cookieHeader
      .split(';')
      .find(c => c.trim().startsWith('ps_session='))
      ?.split('=')[1];

    if (!sessionCookie) {
      const response = Response.json({ error: 'No session' }, { status: 401 });
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
      const response = Response.json({ error: 'Invalid session' }, { status: 401 });
      return addSecurityHeaders(response);
    }

    console.log('✅ Usuário autenticado:', session.email);

    // Buscar todos os usuários únicos com suas estatísticas
    const usersQuery = await env.DB.prepare(`
      SELECT 
        u.email,
        COUNT(DISTINCT fr.id) as total_runs,
        COALESCE(SUM(fr.tokens), 0) as total_tokens,
        COALESCE(AVG(fr.efficiency), 0) as avg_efficiency,
        MAX(fr.created_at) as last_activity
      FROM users u
      LEFT JOIN feed_runs fr ON u.email = fr.user_email
      WHERE fr.created_at > ? -- Últimos 30 dias
      GROUP BY u.email
      ORDER BY total_runs DESC
      LIMIT 50
    `).bind(Date.now() - (30 * 24 * 60 * 60 * 1000)).all();

    console.log(`📊 Encontrados ${usersQuery.results?.length || 0} usuários com atividade`);

    // Processar dados dos usuários
    const users = (usersQuery.results || []).map((user: any) => ({
      email: user.email,
      totalRuns: user.total_runs || 0,
      totalProfit: user.total_tokens || 0,
      efficiency: Math.round((user.avg_efficiency || 0) * 100) / 100,
      lastActivity: user.last_activity ? new Date(user.last_activity).toISOString() : new Date().toISOString(),
      status: user.last_activity && (Date.now() - user.last_activity) < (7 * 24 * 60 * 60 * 1000) ? 'active' : 'inactive'
    }));

    // Se não houver usuários com atividade, buscar usuários que fizeram login
    if (users.length === 0) {
      console.log('📊 Nenhum usuário com atividade encontrado, buscando usuários que fizeram login...');
      
      const loginUsersQuery = await env.DB.prepare(`
        SELECT 
          u.email,
          MAX(s.created_at) as last_login
        FROM users u
        LEFT JOIN sessions s ON u.id = s.user_id
        WHERE s.created_at > ?
        GROUP BY u.email
        ORDER BY last_login DESC
        LIMIT 20
      `).bind(Date.now() - (30 * 24 * 60 * 60 * 1000)).all();

      const loginUsers = (loginUsersQuery.results || []).map((user: any) => ({
        email: user.email,
        totalRuns: 0,
        totalProfit: 0,
        efficiency: 0,
        lastActivity: user.last_login ? new Date(user.last_login).toISOString() : new Date().toISOString(),
        status: 'inactive'
      }));

      users.push(...loginUsers);
    }

    console.log(`✅ Retornando ${users.length} usuários`);

    const response = Response.json({
      success: true,
      users: users,
      total: users.length,
      activeUsers: users.filter(u => u.status === 'active').length,
      inactiveUsers: users.filter(u => u.status === 'inactive').length
    });
    
    return addSecurityHeaders(response);

  } catch (error) {
    console.error('❌ Erro ao buscar usuários:', error);
    const response = Response.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 });
    return addSecurityHeaders(response);
  }
}