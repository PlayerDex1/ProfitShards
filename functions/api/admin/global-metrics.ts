import { addSecurityHeaders } from '../../_lib/security';

interface Env {
  DB: D1Database;
}

interface LuckRange {
  range: string;
  runs: number;
  totalTokens: number;
  avgTokens: number;
  users: number;
}

export async function onRequestGet({ env, request }: { env: Env; request: Request }) {
  try {
    console.log('🌍 GLOBAL METRICS: Iniciando (D1 FORÇADO)...');

    // Verificar se DB está disponível
    if (!env.DB) {
      console.log('❌ D1 Database não disponível');
      const response = Response.json({ 
        success: false,
        error: 'Database not available' 
      }, { status: 500 });
      return addSecurityHeaders(response);
    }

    console.log('✅ D1 Database disponível');

    // Verificar autenticação
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) {
      console.log('❌ Cookie não encontrado');
      const response = Response.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 });
      return addSecurityHeaders(response);
    }

    const sessionCookie = cookieHeader
      .split(';')
      .find(c => c.trim().startsWith('ps_session='))
      ?.split('=')[1];

    if (!sessionCookie) {
      console.log('❌ Sessão não encontrada');
      const response = Response.json({ 
        success: false,
        error: 'No session' 
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
      console.log('❌ Sessão inválida ou expirada');
      const response = Response.json({ 
        success: false,
        error: 'Invalid session' 
      }, { status: 401 });
      return addSecurityHeaders(response);
    }

    // Verificar se é admin
    const isAdmin = session.email === 'holdboy01@gmail.com';
    if (!isAdmin) {
      console.log('❌ Usuário não é admin:', session.email);
      const response = Response.json({ 
        success: false,
        error: 'Access denied' 
      }, { status: 403 });
      return addSecurityHeaders(response);
    }

    console.log('✅ Admin autenticado:', session.email);

    // Buscar TODOS os dados da tabela user_map_metrics
    console.log('🔍 Buscando TODOS os dados da tabela user_map_metrics...');
    
    const allMetrics = await env.DB.prepare(`
      SELECT * FROM user_map_metrics 
      ORDER BY created_at DESC
    `).all();

    console.log(`📊 Total de registros encontrados: ${allMetrics.results?.length || 0}`);
    
    if (allMetrics.results && allMetrics.results.length > 0) {
      console.log('📊 Primeiros 3 registros:', allMetrics.results.slice(0, 3));
    }

    // Contar usuários únicos
    const uniqueUsersResult = await env.DB.prepare(`
      SELECT COUNT(DISTINCT user_email) as count FROM user_map_metrics
    `).first() as { count: number } | null;

    const uniqueUsers = uniqueUsersResult?.count || 0;
    console.log(`👥 Usuários únicos com dados: ${uniqueUsers}`);

    // Contar total de usuários registrados
    const totalUsersResult = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM users
    `).first() as { count: number } | null;

    const totalRegisteredUsers = totalUsersResult?.count || 0;
    console.log(`👥 Total de usuários registrados: ${totalRegisteredUsers}`);

    // Processar dados em faixas de luck
    const luckRanges: LuckRange[] = [
      { range: '1k - 2k Luck', runs: 0, totalTokens: 0, avgTokens: 0, users: 0 },
      { range: '2k - 3k Luck', runs: 0, totalTokens: 0, avgTokens: 0, users: 0 },
      { range: '3k - 4k Luck', runs: 0, totalTokens: 0, avgTokens: 0, users: 0 },
      { range: '4k - 5k Luck', runs: 0, totalTokens: 0, avgTokens: 0, users: 0 },
      { range: '5k - 6k Luck', runs: 0, totalTokens: 0, avgTokens: 0, users: 0 },
      { range: '6k - 7k Luck', runs: 0, totalTokens: 0, avgTokens: 0, users: 0 },
      { range: '7k - 8k Luck', runs: 0, totalTokens: 0, avgTokens: 0, users: 0 },
      { range: '8k+ Luck', runs: 0, totalTokens: 0, avgTokens: 0, users: 0 }
    ];

    let totalRuns = 0;
    let totalTokens = 0;
    const usersByRange: { [key: string]: Set<string> } = {};

    // Inicializar sets para contar usuários únicos por faixa
    luckRanges.forEach(range => {
      usersByRange[range.range] = new Set<string>();
    });

    // Processar cada métrica
    if (allMetrics.results) {
      for (const metric of allMetrics.results) {
        const luck = Number(metric.luck_value) || 0;
        const tokens = Number(metric.tokens_dropped) || 0;
        const userEmail = String(metric.user_email);

        totalRuns++;
        totalTokens += tokens;

        // Determinar faixa de luck
        let rangeIndex = -1;
        if (luck >= 1000 && luck < 2000) rangeIndex = 0;
        else if (luck >= 2000 && luck < 3000) rangeIndex = 1;
        else if (luck >= 3000 && luck < 4000) rangeIndex = 2;
        else if (luck >= 4000 && luck < 5000) rangeIndex = 3;
        else if (luck >= 5000 && luck < 6000) rangeIndex = 4;
        else if (luck >= 6000 && luck < 7000) rangeIndex = 5;
        else if (luck >= 7000 && luck < 8000) rangeIndex = 6;
        else if (luck >= 8000) rangeIndex = 7;

        if (rangeIndex >= 0) {
          luckRanges[rangeIndex].runs++;
          luckRanges[rangeIndex].totalTokens += tokens;
          usersByRange[luckRanges[rangeIndex].range].add(userEmail);
        }
      }
    }

    // Calcular médias e contar usuários
    luckRanges.forEach(range => {
      if (range.runs > 0) {
        range.avgTokens = Math.round(range.totalTokens / range.runs);
      }
      range.users = usersByRange[range.range].size;
    });

    console.log('📊 Estatísticas finais:', {
      totalRuns,
      totalTokens,
      uniqueUsers,
      totalRegisteredUsers
    });

    const response = Response.json({
      success: true,
      totalRuns,
      totalTokens,
      uniqueUsers,
      totalRegisteredUsers,
      luckRanges,
      rawData: allMetrics.results || [],
      debug: {
        recordsFound: allMetrics.results?.length || 0,
        sampleRecord: allMetrics.results?.[0] || null
      }
    });
    
    return addSecurityHeaders(response);

  } catch (error) {
    console.error('❌ Erro no global-metrics:', error);
    const response = Response.json({ 
      success: false,
      error: 'Internal server error',
      message: error.message,
      stack: error.stack
    }, { status: 500 });
    return addSecurityHeaders(response);
  }
}