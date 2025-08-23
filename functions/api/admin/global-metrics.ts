import { addSecurityHeaders, checkRateLimit, getClientIP } from '../../_lib/security';
import { createUserHash } from '../../_lib/metrics';

interface Env {
  DB: D1Database;
  KV?: KVNamespace;
}

export async function onRequestGet({ env, request }: { env: Env; request: Request }) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitCheck = await checkRateLimit(env, clientIP, 'api', request);
    if (!rateLimitCheck.allowed) {
      const response = Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
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
      const response = Response.json({ error: 'No session cookie' }, { status: 401 });
      return addSecurityHeaders(response);
    }

    // Validar sessão e verificar se é admin
    const session = await env.DB.prepare(`
      SELECT u.email as user_email 
      FROM sessions s 
      JOIN users u ON s.user_id = u.id 
      WHERE s.session_id = ? AND s.expires_at > ?
    `).bind(sessionCookie, Date.now()).first() as { user_email: string } | null;

    if (!session) {
      const response = Response.json({ error: 'Invalid session' }, { status: 401 });
      return addSecurityHeaders(response);
    }

    // Verificar se é admin
    const adminUsers = ['holdboy01@gmail.com'];
    if (!adminUsers.includes(session.user_email)) {
      const response = Response.json({ error: 'Admin access required' }, { status: 403 });
      return addSecurityHeaders(response);
    }

    console.log('📊 Global metrics - Admin:', session.user_email);

    // Buscar TODOS os usuários e seus dados
    const users = await env.DB.prepare(
      'SELECT id, email, created_at FROM users ORDER BY created_at DESC'
    ).all();

    console.log('👥 Total de usuários encontrados:', users.results?.length || 0);

    const globalData = [];

    // Para cada usuário, buscar dados usando o hash
    for (const user of users.results || []) {
      const userRecord = user as { id: string; email: string; created_at: number };
      
      try {
        // Gerar hash do usuário
        const userHash = createUserHash(userRecord.id);
        console.log(`📊 Processando usuário ${userRecord.email} - hash: ${userHash}`);
        
        // Buscar dados de map drops para este usuário
        const userMetrics = await env.DB.prepare(`
          SELECT 
            map_name,
            luck_value,
            tokens_dropped,
            loads_completed,
            session_date,
            created_at
          FROM map_drop_metrics 
          WHERE user_hash = ?
          ORDER BY created_at DESC
        `).bind(userHash).all();

        if (userMetrics.results && userMetrics.results.length > 0) {
          console.log(`📊 Usuário ${userRecord.email}: ${userMetrics.results.length} métricas encontradas`);
          
          for (const metric of userMetrics.results) {
            const metricData = metric as any;
            globalData.push({
              userEmail: userRecord.email,
              timestamp: metricData.created_at,
              mapSize: metricData.map_name,
              tokensDropped: metricData.tokens_dropped,
              totalLuck: metricData.luck_value,
              loads: metricData.loads_completed,
              sessionDate: metricData.session_date
            });
          }
        } else {
          console.log(`📊 Usuário ${userRecord.email}: Nenhuma métrica encontrada`);
        }

      } catch (error) {
        console.log(`❌ Erro ao processar usuário ${userRecord.email}:`, error);
      }
    }

    console.log('📊 Total de dados globais coletados:', globalData.length);

    // Processar dados por faixas de luck
    const ranges = [
      { range: '1k - 2k Luck', min: 1000, max: 1999 },
      { range: '2k - 3k Luck', min: 2000, max: 2999 },
      { range: '3k - 4k Luck', min: 3000, max: 3999 },
      { range: '4k - 5k Luck', min: 4000, max: 4999 },
      { range: '5k - 6k Luck', min: 5000, max: 5999 },
      { range: '6k - 7k Luck', min: 6000, max: 6999 },
      { range: '7k - 8k Luck', min: 7000, max: 7999 },
      { range: '8k+ Luck', min: 8000, max: 999999 },
    ];

    const processedRanges = ranges.map(({ range, min, max }) => {
      const rangeData = globalData.filter(item => {
        const luck = item.totalLuck || 0;
        return luck >= min && luck <= max;
      });

      const totalTokens = rangeData.reduce((sum, item) => sum + (item.tokensDropped || 0), 0);
      const avgTokens = rangeData.length > 0 ? totalTokens / rangeData.length : 0;

      return {
        range,
        runs: rangeData.length,
        totalTokens,
        avgTokens,
        users: new Set(rangeData.map(item => item.userEmail)).size
      };
    });

    const totalRuns = globalData.length;
    const totalTokens = globalData.reduce((sum, item) => sum + (item.tokensDropped || 0), 0);
    const uniqueUsers = new Set(globalData.map(item => item.userEmail)).size;

    const result = {
      success: true,
      totalRuns,
      totalTokens,
      uniqueUsers,
      totalRegisteredUsers: users.results?.length || 0,
      luckRanges: processedRanges,
      rawData: globalData.slice(0, 100) // Primeiros 100 registros para debug
    };

    console.log('📊 Resultado processado:', {
      totalRuns: result.totalRuns,
      totalTokens: result.totalTokens,
      uniqueUsers: result.uniqueUsers
    });

    const response = Response.json(result);
    return addSecurityHeaders(response);

  } catch (error) {
    console.error('❌ Erro em global-metrics:', error);
    const response = Response.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 });
    return addSecurityHeaders(response);
  }
}