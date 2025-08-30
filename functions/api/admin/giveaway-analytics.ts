// API para Analytics de Giveaways
import { createResponse, createErrorResponse } from '../../_lib/response';
import { checkRateLimit, getClientIP } from '../../_lib/security';

export async function onRequestGet(context: any) {
  const { request, env } = context;
  const clientIP = getClientIP(request);

  try {
    // Rate limiting para admin
    const rateLimitResult = await checkRateLimit(env, clientIP, 'api', request);
    if (!rateLimitResult.allowed) {
      return createErrorResponse('Too many requests', 429);
    }

    // Estatísticas gerais de giveaways
    const totalGiveawaysResult = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM giveaways
    `).first();

    const totalParticipantsResult = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM giveaway_participants
    `).first();

    const totalWinnersResult = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM giveaway_participants WHERE is_winner = 1
    `).first();

    // Taxa de conversão (participantes únicos vs visitantes estimados)
    const uniqueParticipantsResult = await env.DB.prepare(`
      SELECT COUNT(DISTINCT user_id) as count FROM giveaway_participants
    `).first();

    // Giveaways recentes com performance
    const recentGiveawaysResult = await env.DB.prepare(`
      SELECT 
        g.id,
        g.title,
        g.status,
        g.created_at,
        COUNT(p.id) as participants,
        COUNT(CASE WHEN p.is_winner = 1 THEN 1 END) as winners
      FROM giveaways g
      LEFT JOIN giveaway_participants p ON g.id = p.giveaway_id
      GROUP BY g.id, g.title, g.status, g.created_at
      ORDER BY g.created_at DESC
      LIMIT 10
    `).all();

    // Calcular taxa de conversão (estimativa baseada em participantes únicos)
    const uniqueParticipants = uniqueParticipantsResult?.count || 0;
    const estimatedVisitors = uniqueParticipants * 3; // Estimativa: 1 em 3 visitantes participa
    const conversionRate = estimatedVisitors > 0 ? (uniqueParticipants / estimatedVisitors) * 100 : 0;

    const stats = {
      totalGiveaways: totalGiveawaysResult?.count || 0,
      totalParticipants: totalParticipantsResult?.count || 0,
      totalWinners: totalWinnersResult?.count || 0,
      conversionRate,
      emailsSent: 0, // Será preenchido pela API de email metrics
      emailResponseRate: 0,
      avgTimeToClaimHours: 0,
      recentGiveaways: (recentGiveawaysResult.results || []).map((g: any) => ({
        id: g.id,
        title: g.title,
        participants: g.participants,
        winners: g.winners,
        createdAt: g.created_at,
        status: g.status
      }))
    };

    console.log('📊 GIVEAWAY ANALYTICS:', {
      totalGiveaways: stats.totalGiveaways,
      totalParticipants: stats.totalParticipants,
      conversionRate: stats.conversionRate.toFixed(2) + '%'
    });

    return createResponse({
      success: true,
      stats,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ ANALYTICS ERROR:', error);
    return createErrorResponse('Failed to load analytics: ' + error.message, 500);
  }
}