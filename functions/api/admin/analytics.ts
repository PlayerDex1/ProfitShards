import { addSecurityHeaders } from '../../_lib/security';

interface Env {
  DB: D1Database;
}

interface HourlyActivity {
  hour: number;
  runs: number;
  tokens: number;
}

interface MapEfficiency {
  mapSize: string;
  avgEfficiency: number;
  totalRuns: number;
}

interface TopUser {
  email: string;
  username: string;
  totalRuns: number;
  totalTokens: number;
  avgEfficiency: number;
}

interface WeeklyTrend {
  week: string;
  runs: number;
  tokens: number;
  users: number;
}

export async function onRequestGet({ env, request }: { env: Env; request: Request }) {
  try {
    console.log('📈 ANALYTICS: Iniciando análise avançada...');

    // Verificar se DB está disponível
    if (!env.DB) {
      console.log('❌ D1 Database não disponível');
      const response = Response.json({ 
        success: false,
        error: 'Database not available' 
      }, { status: 500 });
      return addSecurityHeaders(response);
    }

    // Verificar autenticação
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) {
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
      const response = Response.json({ 
        success: false,
        error: 'Invalid session' 
      }, { status: 401 });
      return addSecurityHeaders(response);
    }

    // Verificar se é admin
    const isAdmin = session.email === 'holdboy01@gmail.com';
    if (!isAdmin) {
      const response = Response.json({ 
        success: false,
        error: 'Access denied' 
      }, { status: 403 });
      return addSecurityHeaders(response);
    }

    console.log('✅ Admin autenticado para analytics:', session.email);

    // Buscar todos os dados incluindo username
    const allMetrics = await env.DB.prepare(`
      SELECT m.*, u.username 
      FROM user_map_metrics m
      LEFT JOIN users u ON m.user_email = u.email
      ORDER BY m.created_at DESC
    `).all();

    console.log(`📊 Total de registros para analytics: ${allMetrics.results?.length || 0}`);

    if (!allMetrics.results || allMetrics.results.length === 0) {
      // Retornar dados vazios se não houver registros
      const emptyResponse = {
        success: true,
        hourlyActivity: Array.from({ length: 24 }, (_, i) => ({ hour: i, runs: 0, tokens: 0 })),
        mapEfficiency: [
          { mapSize: 'small', avgEfficiency: 0, totalRuns: 0 },
          { mapSize: 'medium', avgEfficiency: 0, totalRuns: 0 },
          { mapSize: 'large', avgEfficiency: 0, totalRuns: 0 },
          { mapSize: 'xlarge', avgEfficiency: 0, totalRuns: 0 }
        ],

        weeklyTrends: []
      };
      
      const response = Response.json(emptyResponse);
      return addSecurityHeaders(response);
    }

    // 1. ATIVIDADE POR HORÁRIO
    const hourlyActivity: HourlyActivity[] = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      runs: 0,
      tokens: 0
    }));

    // 2. EFICIÊNCIA POR MAPA
    const mapStats: { [key: string]: { totalTokens: number; totalLoads: number; runs: number } } = {};

    // 3. TOP USUÁRIOS
    const userStats: { [email: string]: { runs: number; tokens: number; loads: number; username: string } } = {};

    // 4. TENDÊNCIAS SEMANAIS
    const weeklyStats: { [week: string]: { runs: number; tokens: number; users: Set<string> } } = {};

    // Processar todos os registros
    for (const metric of allMetrics.results) {
      const timestamp = Number(metric.timestamp);
      const date = new Date(timestamp);
      const hour = date.getHours();
      const week = getWeekKey(date);
      const mapSize = String(metric.map_size).toLowerCase();
      const userEmail = String(metric.user_email);
      const username = String(metric.username) || userEmail.split('@')[0];
      const tokens = Number(metric.tokens_dropped) || 0;
      const loads = Number(metric.loads) || 1;

      // Atividade por horário
      hourlyActivity[hour].runs++;
      hourlyActivity[hour].tokens += tokens;

      // Eficiência por mapa
      if (!mapStats[mapSize]) {
        mapStats[mapSize] = { totalTokens: 0, totalLoads: 0, runs: 0 };
      }
      mapStats[mapSize].totalTokens += tokens;
      mapStats[mapSize].totalLoads += loads;
      mapStats[mapSize].runs++;

      // Top usuários
      if (!userStats[userEmail]) {
        userStats[userEmail] = { runs: 0, tokens: 0, loads: 0, username };
      }
      userStats[userEmail].runs++;
      userStats[userEmail].tokens += tokens;
      userStats[userEmail].loads += loads;

      // Tendências semanais
      if (!weeklyStats[week]) {
        weeklyStats[week] = { runs: 0, tokens: 0, users: new Set() };
      }
      weeklyStats[week].runs++;
      weeklyStats[week].tokens += tokens;
      weeklyStats[week].users.add(userEmail);
    }

    // Processar eficiência por mapa
    const mapEfficiency: MapEfficiency[] = Object.entries(mapStats).map(([mapSize, stats]) => ({
      mapSize,
      avgEfficiency: stats.totalLoads > 0 ? stats.totalTokens / stats.totalLoads : 0,
      totalRuns: stats.runs
    })).sort((a, b) => b.avgEfficiency - a.avgEfficiency);

    // Processar tendências semanais
    const weeklyTrends: WeeklyTrend[] = Object.entries(weeklyStats)
      .map(([week, stats]) => ({
        week,
        runs: stats.runs,
        tokens: stats.tokens,
        users: stats.users.size
      }))
      .sort((a, b) => a.week.localeCompare(b.week))
      .slice(-8); // Últimas 8 semanas

    console.log('📊 Analytics processados:', {
      totalRecords: allMetrics.results.length,
      mapEfficiencyCount: mapEfficiency.length,
      weeklyTrendsCount: weeklyTrends.length
    });

    const response = Response.json({
      success: true,
      hourlyActivity,
      mapEfficiency,
      weeklyTrends
    });
    
    return addSecurityHeaders(response);

  } catch (error) {
    console.error('❌ Erro no analytics:', error);
    const response = Response.json({ 
      success: false,
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
    return addSecurityHeaders(response);
  }
}

// Função auxiliar para gerar chave da semana
function getWeekKey(date: Date): string {
  const year = date.getFullYear();
  const week = getWeekNumber(date);
  return `${year}-W${week.toString().padStart(2, '0')}`;
}

// Função auxiliar para calcular número da semana
function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}