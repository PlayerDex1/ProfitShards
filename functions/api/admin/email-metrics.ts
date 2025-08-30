// API para Métricas de Email
import { createResponse, createErrorResponse } from '../../_lib/response';
import { checkRateLimit, getClientIP } from '../../_lib/security';

export async function onRequestGet(context: any) {
  const { request, env } = context;
  const clientIP = getClientIP(request);

  try {
    // Rate limiting
    const rateLimitResult = await checkRateLimit(env, clientIP, 'api', request);
    if (!rateLimitResult.allowed) {
      return createErrorResponse('Too many requests', 429);
    }

    // Verificar se tabela de email logs existe
    const emailLogsExist = await checkTableExists(env, 'winner_email_logs');
    
    if (!emailLogsExist) {
      return createResponse({
        success: true,
        metrics: {
          totalSent: 0,
          responded: 0,
          pending: 0,
          responseRate: 0,
          avgResponseTimeHours: 0
        }
      });
    }

    // Total de emails enviados
    const totalSentResult = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM winner_email_logs
    `).first();

    // Emails com resposta (assumindo que winner_contact_data indica resposta)
    const respondedResult = await env.DB.prepare(`
      SELECT COUNT(DISTINCT wel.winner_id) as count 
      FROM winner_email_logs wel
      WHERE EXISTS (
        SELECT 1 FROM giveaway_participants gp 
        WHERE gp.id = wel.winner_id 
        AND (gp.claimed = 1 OR gp.discord_contacted = 1)
      )
    `).first();

    const totalSent = totalSentResult?.count || 0;
    const responded = respondedResult?.count || 0;
    const pending = totalSent - responded;
    const responseRate = totalSent > 0 ? (responded / totalSent) * 100 : 0;

    // Tempo médio de resposta (estimativa baseada em timestamps)
    const avgResponseTimeResult = await env.DB.prepare(`
      SELECT AVG(
        (gp.updated_at - wel.sent_at) / (1000 * 60 * 60)
      ) as avg_hours
      FROM winner_email_logs wel
      JOIN giveaway_participants gp ON wel.winner_id = gp.id
      WHERE gp.claimed = 1 OR gp.discord_contacted = 1
    `).first();

    const avgResponseTimeHours = avgResponseTimeResult?.avg_hours || 0;

    const metrics = {
      totalSent,
      responded,
      pending,
      responseRate,
      avgResponseTimeHours
    };

    console.log('📧 EMAIL METRICS:', metrics);

    return createResponse({
      success: true,
      metrics,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ EMAIL METRICS ERROR:', error);
    return createErrorResponse('Failed to load email metrics: ' + error.message, 500);
  }
}

// Helper para verificar se tabela existe
async function checkTableExists(env: any, tableName: string): Promise<boolean> {
  try {
    const result = await env.DB.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name=?
    `).bind(tableName).first();
    
    return !!result;
  } catch (error) {
    return false;
  }
}