// API para Enviar Email para Ganhadores
import { createResponse, createErrorResponse } from '../../_lib/response';
import { checkRateLimit, sanitizeString, logAuditEvent, getClientIP } from '../../_lib/security';
import { sendWinnerNotification } from '../../_lib/emailService';

export async function onRequestPost(context: any) {
  const { request, env } = context;
  const clientIP = getClientIP(request);

  try {
    // Rate limiting para envio de emails
    const rateLimitResult = await checkRateLimit(env, clientIP, 'strict', request);
    if (!rateLimitResult.allowed) {
      return createErrorResponse('Too many email attempts', 429);
    }

    const data = await request.json();
    const { winnerId, customMessage, adminId } = data;

    if (!winnerId || !adminId) {
      return createErrorResponse('Winner ID and Admin ID are required', 400);
    }

    // Buscar dados do ganhador
    const winner = await env.DB.prepare(`
      SELECT 
        p.id,
        p.user_email,
        p.total_points,
        p.winner_position,
        g.title as giveaway_title,
        g.prize,
        g.winner_announcement
      FROM giveaway_participants p
      JOIN giveaways g ON p.giveaway_id = g.id
      WHERE p.id = ? AND p.is_winner = 1
    `).bind(winnerId).first();

    if (!winner) {
      return createErrorResponse('Winner not found', 404);
    }

    // Preparar dados para email
    const winnerEmailData = {
      userEmail: winner.user_email,
      giveawayTitle: winner.giveaway_title,
      prize: winner.prize,
      position: winner.winner_position,
      totalPoints: winner.total_points,
      winnerAnnouncement: winner.winner_announcement
    };

    // Enviar email
    const emailResult = await sendWinnerNotification(
      env,
      winnerEmailData,
      customMessage ? sanitizeString(customMessage, 2000) : undefined
    );

    if (emailResult.success) {
      // Marcar como notificado no banco
      await env.DB.prepare(`
        UPDATE giveaway_participants SET
          email_sent = TRUE,
          email_sent_at = ?,
          email_provider = ?,
          email_message_id = ?,
          updated_at = ?
        WHERE id = ?
      `).bind(
        new Date().toISOString(),
        emailResult.provider,
        emailResult.messageId || '',
        new Date().toISOString(),
        winnerId
      ).run();

      // Log de auditoria
      await logAuditEvent(
        env,
        adminId,
        'winner_email_sent',
        {
          winnerId,
          winnerEmail: winner.user_email,
          provider: emailResult.provider,
          messageId: emailResult.messageId,
          giveawayTitle: winner.giveaway_title
        },
        clientIP
      );

      return createResponse({
        success: true,
        message: `Email sent successfully via ${emailResult.provider}`,
        data: {
          provider: emailResult.provider,
          messageId: emailResult.messageId,
          winnerEmail: winner.user_email,
          sentAt: new Date().toISOString()
        }
      });

    } else {
      // Log do erro
      await logAuditEvent(
        env,
        adminId,
        'winner_email_failed',
        {
          winnerId,
          winnerEmail: winner.user_email,
          error: emailResult.error,
          provider: emailResult.provider
        },
        clientIP
      );

      return createErrorResponse(
        `Email sending failed: ${emailResult.error}`, 
        500,
        {
          'X-Email-Provider': emailResult.provider,
          'X-Email-Error': emailResult.error || 'unknown'
        }
      );
    }

  } catch (error) {
    console.error('❌ EMAIL SEND ERROR:', error);
    return createErrorResponse('Email sending failed: ' + error.message, 500);
  }
}