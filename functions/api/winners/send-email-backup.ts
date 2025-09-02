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

    console.log('🔍 BUSCANDO GANHADOR:', { winnerId, adminId });
    console.log('🔧 ENVIRONMENT CHECK:', {
      hasResendKey: !!env.RESEND_API_KEY,
      hasSendGridKey: !!env.SENDGRID_API_KEY,
      hasBrevoKey: !!env.BREVO_API_KEY,
      emailFrom: env.EMAIL_FROM || 'not set'
    });

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

    console.log('📊 RESULTADO BUSCA:', { 
      found: !!winner, 
      winnerId,
      winnerEmail: winner?.user_email 
    });

    if (!winner) {
      console.error('❌ GANHADOR NÃO ENCONTRADO:', winnerId);
      return createErrorResponse('Winner not found in database', 404);
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
      // Criar tabela para tracking de emails se não existir
      try {
        await env.DB.prepare(`
          CREATE TABLE IF NOT EXISTS winner_email_logs (
            id TEXT PRIMARY KEY,
            winner_id TEXT NOT NULL,
            winner_email TEXT NOT NULL,
            email_provider TEXT NOT NULL,
            email_message_id TEXT,
            custom_message TEXT,
            sent_by TEXT NOT NULL,
            sent_at INTEGER NOT NULL,
            giveaway_title TEXT
          )
        `).run();

        // Salvar log do email enviado
        await env.DB.prepare(`
          INSERT INTO winner_email_logs (
            id, winner_id, winner_email, email_provider, email_message_id,
            custom_message, sent_by, sent_at, giveaway_title
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          crypto.randomUUID(),
          winnerId,
          winner.user_email,
          emailResult.provider,
          emailResult.messageId || '',
          customMessage || '',
          adminId,
          Date.now(),
          winner.giveaway_title
        ).run();

        console.log('📧 EMAIL LOG SALVO:', {
          winnerId,
          provider: emailResult.provider,
          messageId: emailResult.messageId
        });

      } catch (logError) {
        console.error('Erro ao salvar log de email:', logError);
        // Não falhar o envio por causa do log
      }

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