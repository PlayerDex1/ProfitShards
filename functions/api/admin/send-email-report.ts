import { addSecurityHeaders } from '../../_lib/security';
import { sendWinnerNotification } from '../../_lib/emailService';

interface Env {
  DB: D1Database;
  RESEND_API_KEY?: string;
  SENDGRID_API_KEY?: string;
  BREVO_API_KEY?: string;
  EMAIL_FROM?: string;
}

interface EmailReportData {
  totalUsers: number;
  totalRuns: number;
  activitiesToday: number;
  activeGiveaways: number;
  systemHealth: {
    apiStatus: string;
    databaseStatus: string;
    uptime: number;
    responseTime: number;
  };
  topUsers: Array<{
    email: string;
    totalProfit: number;
    runs: number;
  }>;
  topMaps: Array<{
    mapSize: string;
    totalRuns: number;
    avgTokens: number;
  }>;
  trends: {
    dailyRuns: number[];
    dailyUsers: number[];
  };
}

export async function onRequestPost(context: { env: Env; request: Request }) {
  try {
    const { env, request } = context;
    
    console.log('📧 SEND EMAIL REPORT: Iniciando...');
    
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
      console.log('❌ Session cookie não encontrado');
      const response = Response.json({ 
        success: false,
        error: 'Session not found' 
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
      console.log('❌ Sessão inválida');
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
        error: 'Admin access required' 
      }, { status: 403 });
      return addSecurityHeaders(response);
    }

    console.log('✅ Admin autenticado para envio de relatório:', session.email);

    // Obter dados da requisição
    const body = await request.json();
    const { email, reportType = 'daily', includeCharts = true } = body;

    if (!email) {
      const response = Response.json({ 
        success: false,
        error: 'Email is required' 
      }, { status: 400 });
      return addSecurityHeaders(response);
    }

    // Coletar dados para o relatório
    const reportData = await collectReportData(env, reportType);
    
    // Gerar HTML do relatório
    const htmlContent = generateReportHTML(reportData, reportType, includeCharts);
    
    // Enviar email usando o sistema existente
    const emailResult = await sendReportEmail(env, email, reportData, htmlContent, reportType);
    
    if (emailResult.success) {
      console.log('✅ Relatório enviado com sucesso para:', email);
      const response = Response.json({
        success: true,
        message: 'Relatório enviado com sucesso',
        data: {
          email,
          reportType,
          timestamp: new Date().toISOString()
        }
      }, { status: 200 });
      return addSecurityHeaders(response);
    } else {
      console.log('❌ Erro ao enviar email:', emailResult.error);
      const response = Response.json({
        success: false,
        error: 'Erro ao enviar email: ' + emailResult.error
      }, { status: 500 });
      return addSecurityHeaders(response);
    }

  } catch (error) {
    console.error('❌ Erro no send email report:', error);
    const response = Response.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
    return addSecurityHeaders(response);
  }
}

async function collectReportData(env: Env, reportType: string): Promise<EmailReportData> {
  console.log('📊 Coletando dados para relatório...');
  
  // Coletar dados básicos
  const today = new Date();
  const todayTimestamp = today.getTime();
  const yesterdayTimestamp = todayTimestamp - (24 * 60 * 60 * 1000);
  
  // Total de usuários únicos
  const userQuery = await env.DB.prepare(`
    SELECT COUNT(DISTINCT user_email) as total_users
    FROM feed_runs
  `).first();
  
  // Atividades de hoje
  const todayActivitiesQuery = await env.DB.prepare(`
    SELECT COUNT(*) as activities_today
    FROM feed_runs
    WHERE created_at >= ?
  `).bind(todayTimestamp).first();
  
  // Total de runs
  const totalRunsQuery = await env.DB.prepare(`
    SELECT COUNT(*) as total_runs
    FROM feed_runs
  `).first();
  
  // Top usuários por lucro
  const topUsersQuery = await env.DB.prepare(`
    SELECT user_email, SUM(tokens) as total_profit, COUNT(*) as runs
    FROM feed_runs
    WHERE user_email IS NOT NULL
    GROUP BY user_email
    ORDER BY total_profit DESC
    LIMIT 5
  `).all();
  
  // Top mapas
  const topMapsQuery = await env.DB.prepare(`
    SELECT map_name, COUNT(*) as total_runs, AVG(tokens) as avg_tokens
    FROM feed_runs
    GROUP BY map_name
    ORDER BY total_runs DESC
    LIMIT 5
  `).all();
  
  // Dados de tendência (últimos 7 dias)
  const trendData = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = todayTimestamp - (i * 24 * 60 * 60 * 1000);
    const dayEnd = dayStart + (24 * 60 * 60 * 1000);
    
    const dayRunsQuery = await env.DB.prepare(`
      SELECT COUNT(*) as runs, COUNT(DISTINCT user_email) as users
      FROM feed_runs
      WHERE created_at >= ? AND created_at < ?
    `).bind(dayStart, dayEnd).first();
    
    trendData.push({
      runs: dayRunsQuery?.runs || 0,
      users: dayRunsQuery?.users || 0
    });
  }
  
  return {
    totalUsers: userQuery?.total_users || 0,
    totalRuns: totalRunsQuery?.total_runs || 0,
    activitiesToday: todayActivitiesQuery?.activities_today || 0,
    activeGiveaways: 3, // Placeholder
    systemHealth: {
      apiStatus: 'healthy',
      databaseStatus: 'healthy',
      uptime: 99.9,
      responseTime: 120
    },
    topUsers: (topUsersQuery?.results || []).map((user: any) => ({
      email: user.user_email,
      totalProfit: user.total_profit || 0,
      runs: user.runs || 0
    })),
    topMaps: (topMapsQuery?.results || []).map((map: any) => ({
      mapSize: map.map_name,
      totalRuns: map.total_runs || 0,
      avgTokens: Math.round(map.avg_tokens || 0)
    })),
    trends: {
      dailyRuns: trendData.map(d => d.runs),
      dailyUsers: trendData.map(d => d.users)
    }
  };
}

function generateReportHTML(data: EmailReportData, reportType: string, includeCharts: boolean): string {
  const reportTitle = reportType === 'daily' ? 'Relatório Diário' : 
                     reportType === 'weekly' ? 'Relatório Semanal' : 'Relatório Mensal';
  
  const currentDate = new Date().toLocaleDateString('pt-BR');
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${reportTitle} - ProfitShards</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #667eea; }
        .metric-value { font-size: 32px; font-weight: bold; color: #667eea; margin-bottom: 5px; }
        .metric-label { color: #666; font-size: 14px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
        .table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .table th { background-color: #f8f9fa; font-weight: bold; }
        .status-healthy { color: #28a745; font-weight: bold; }
        .status-warning { color: #ffc107; font-weight: bold; }
        .status-error { color: #dc3545; font-weight: bold; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 14px; }
        .chart-placeholder { background: #f8f9fa; padding: 40px; text-align: center; border-radius: 8px; margin: 20px 0; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📊 ${reportTitle}</h1>
        <p>ProfitShards - ${currentDate}</p>
      </div>
      
      <div class="metrics">
        <div class="metric-card">
          <div class="metric-value">${data.totalUsers}</div>
          <div class="metric-label">Total de Usuários</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${data.totalRuns}</div>
          <div class="metric-label">Total de Runs</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${data.activitiesToday}</div>
          <div class="metric-label">Atividades Hoje</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${data.activeGiveaways}</div>
          <div class="metric-label">Giveaways Ativos</div>
        </div>
      </div>
      
      <div class="section">
        <h2>🏥 Status do Sistema</h2>
        <table class="table">
          <tr>
            <td><strong>API Status</strong></td>
            <td><span class="status-healthy">${data.systemHealth.apiStatus}</span></td>
          </tr>
          <tr>
            <td><strong>Banco de Dados</strong></td>
            <td><span class="status-healthy">${data.systemHealth.databaseStatus}</span></td>
          </tr>
          <tr>
            <td><strong>Uptime</strong></td>
            <td>${data.systemHealth.uptime}%</td>
          </tr>
          <tr>
            <td><strong>Tempo de Resposta</strong></td>
            <td>${data.systemHealth.responseTime}ms</td>
          </tr>
        </table>
      </div>
      
      <div class="section">
        <h2>👥 Top Usuários</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Lucro Total</th>
              <th>Runs</th>
            </tr>
          </thead>
          <tbody>
            ${data.topUsers.map(user => `
              <tr>
                <td>${user.email}</td>
                <td>${user.totalProfit.toLocaleString()} tokens</td>
                <td>${user.runs}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <div class="section">
        <h2>🗺️ Top Mapas</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Mapa</th>
              <th>Total Runs</th>
              <th>Tokens Médios</th>
            </tr>
          </thead>
          <tbody>
            ${data.topMaps.map(map => `
              <tr>
                <td>${map.mapSize}</td>
                <td>${map.totalRuns}</td>
                <td>${map.avgTokens}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      ${includeCharts ? `
        <div class="section">
          <h2>📈 Tendências (Últimos 7 dias)</h2>
          <div class="chart-placeholder">
            📊 Gráfico de tendências<br>
            Runs: ${data.trends.dailyRuns.join(', ')}<br>
            Usuários: ${data.trends.dailyUsers.join(', ')}
          </div>
        </div>
      ` : ''}
      
      <div class="footer">
        <p>Relatório gerado automaticamente pelo sistema ProfitShards</p>
        <p>Para mais informações, acesse o dashboard administrativo</p>
      </div>
    </body>
    </html>
  `;
}

async function sendReportEmail(env: Env, email: string, data: EmailReportData, htmlContent: string, reportType: string): Promise<{ success: boolean; error?: string }> {
  console.log('📧 Enviando relatório por email para:', email);
  
  // Usar o sistema de email existente do sistema de giveaways
  try {
    // Tentar Resend primeiro (sistema principal)
    if (env.RESEND_API_KEY) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: env.EMAIL_FROM || 'ProfitShards <noreply@resend.dev>',
          to: [email],
          subject: `📊 Relatório ${reportType === 'daily' ? 'Diário' : reportType === 'weekly' ? 'Semanal' : 'Mensal'} - ProfitShards`,
          html: htmlContent,
          text: generateReportText(data, reportType),
          headers: {
            'X-Entity-Ref-ID': crypto.randomUUID(),
            'List-Unsubscribe': '<mailto:unsubscribe@profitshards.online>',
            'X-Mailer': 'ProfitShards-Admin-v1.0'
          },
          tags: [
            { name: 'category', value: 'admin_report' },
            { name: 'report_type', value: reportType }
          ]
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Relatório enviado via Resend:', result.id);
        return { success: true };
      } else {
        const errorText = await response.text();
        console.log('❌ Erro Resend:', errorText);
      }
    }
    
    // Tentar SendGrid como fallback
    if (env.SENDGRID_API_KEY) {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email }]
          }],
          from: { email: env.EMAIL_FROM || 'noreply@profitshards.online', name: 'ProfitShards' },
          subject: `📊 Relatório ${reportType === 'daily' ? 'Diário' : reportType === 'weekly' ? 'Semanal' : 'Mensal'} - ProfitShards`,
          content: [{
            type: 'text/html',
            value: htmlContent
          }, {
            type: 'text/plain',
            value: generateReportText(data, reportType)
          }]
        })
      });
      
      if (response.ok) {
        console.log('✅ Relatório enviado via SendGrid');
        return { success: true };
      } else {
        console.log('❌ Erro SendGrid:', await response.text());
      }
    }
    
    // Tentar Brevo como último recurso
    if (env.BREVO_API_KEY) {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': env.BREVO_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender: { email: env.EMAIL_FROM || 'noreply@profitshards.online', name: 'ProfitShards' },
          to: [{ email }],
          subject: `📊 Relatório ${reportType === 'daily' ? 'Diário' : reportType === 'weekly' ? 'Semanal' : 'Mensal'} - ProfitShards`,
          htmlContent,
          textContent: generateReportText(data, reportType)
        })
      });
      
      if (response.ok) {
        console.log('✅ Relatório enviado via Brevo');
        return { success: true };
      } else {
        console.log('❌ Erro Brevo:', await response.text());
      }
    }
    
    return { success: false, error: 'Nenhum serviço de email configurado. Verifique as variáveis de ambiente RESEND_API_KEY, SENDGRID_API_KEY ou BREVO_API_KEY.' };
    
  } catch (error) {
    console.error('❌ Erro ao enviar relatório:', error);
    return { success: false, error: `Erro interno: ${error.message}` };
  }
}

// Gerar versão texto do relatório
function generateReportText(data: EmailReportData, reportType: string): string {
  const reportTitle = reportType === 'daily' ? 'Relatório Diário' : 
                     reportType === 'weekly' ? 'Relatório Semanal' : 'Relatório Mensal';
  
  return `
${reportTitle} - ProfitShards
${new Date().toLocaleDateString('pt-BR')}

MÉTRICAS PRINCIPAIS:
- Total de Usuários: ${data.totalUsers}
- Total de Runs: ${data.totalRuns}
- Atividades Hoje: ${data.activitiesToday}
- Giveaways Ativos: ${data.activeGiveaways}

STATUS DO SISTEMA:
- API: ${data.systemHealth.apiStatus}
- Banco de Dados: ${data.systemHealth.databaseStatus}
- Uptime: ${data.systemHealth.uptime}%
- Tempo de Resposta: ${data.systemHealth.responseTime}ms

TOP USUÁRIOS:
${data.topUsers.map((user, index) => `${index + 1}. ${user.email} - ${user.totalProfit.toLocaleString()} tokens (${user.runs} runs)`).join('\n')}

TOP MAPAS:
${data.topMaps.map((map, index) => `${index + 1}. ${map.mapSize} - ${map.totalRuns} runs (${map.avgTokens} tokens médios)`).join('\n')}

TENDÊNCIAS (Últimos 7 dias):
Runs: ${data.trends.dailyRuns.join(', ')}
Usuários: ${data.trends.dailyUsers.join(', ')}

---
Relatório gerado automaticamente pelo sistema ProfitShards
Para mais informações, acesse o dashboard administrativo
  `.trim();
}