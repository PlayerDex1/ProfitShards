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

    // Verificar se a tabela user_map_metrics existe
    const tableExists = await env.DB.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='user_map_metrics'
    `).first();
    
    console.log('🔍 Tabela user_map_metrics existe:', !!tableExists);

    // Contar registros na tabela
    if (tableExists) {
      const count = await env.DB.prepare(`SELECT COUNT(*) as count FROM user_map_metrics`).first() as { count: number };
      console.log('📊 Total de registros na tabela:', count?.count || 0);
    }

    // Buscar TODOS os dados de métricas dos usuários
    const globalData = [];

    if (tableExists) {
      console.log('📊 Coletando dados de todos os usuários...');
      
      const allMetrics = await env.DB.prepare(`
        SELECT 
          user_email,
          map_size,
          luck_value,
          tokens_dropped,
          loads,
          timestamp,
          session_date
        FROM user_map_metrics 
        ORDER BY timestamp DESC
      `).all();

      if (allMetrics.results && allMetrics.results.length > 0) {
        console.log(`📊 Total de métricas encontradas: ${allMetrics.results.length}`);
        
        for (const metric of allMetrics.results) {
          const metricData = metric as any;
          globalData.push({
            userEmail: metricData.user_email,
            timestamp: metricData.timestamp,
            mapSize: metricData.map_size,
            tokensDropped: metricData.tokens_dropped,
            totalLuck: metricData.luck_value,
            loads: metricData.loads,
            sessionDate: metricData.session_date
          });
        }
      } else {
        console.log('📊 Nenhuma métrica encontrada na tabela');
      }
    }

    console.log('📊 Total de dados globais coletados:', globalData.length);

    // Logs detalhados para debug
    console.log('🔍 DEBUG: Verificando dados coletados...');
    if (globalData.length > 0) {
      console.log('📊 Primeiros 3 registros:', globalData.slice(0, 3));
    } else {
      console.log('❌ Nenhum dado encontrado');
      console.log('💡 Para popular dados:');
      console.log('   1. Usuários devem fazer login');
      console.log('   2. Fazer testes no Map Planner');
      console.log('   3. Clicar "Sync Data" no dashboard');
    }

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