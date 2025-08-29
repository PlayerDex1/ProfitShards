// API para Enviar Notificações de Ganhadores via Email
import { createResponse, createErrorResponse } from '../../_lib/response';
import { checkRateLimit, sanitizeString, logAuditEvent, getClientIP } from '../../_lib/security';

export async function onRequestPost(context: any) {
  const { request, env } = context;
  const clientIP = getClientIP(request);

  try {
    // Rate limiting para envio de emails
    const rateLimitResult = await checkRateLimit(env, clientIP, 'strict', request);
    if (!rateLimitResult.allowed) {
      return createErrorResponse('Too many notification attempts', 429);
    }

    const data = await request.json();
    const { winnerId, message, adminId } = data;

    if (!winnerId || !message || !adminId) {
      return createErrorResponse('Missing required fields', 400);
    }

    // Buscar dados do ganhador
    const winner = await env.DB.prepare(`
      SELECT 
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

    // 📧 OPÇÃO 1: CLOUDFLARE EMAIL WORKERS (Se configurado)
    if (env.EMAIL_WORKER) {
      const emailResult = await sendEmailViaWorker(env, winner, message);
      if (emailResult.success) {
        await markAsNotified(env, winnerId, adminId, 'email_worker');
        return createResponse({
          success: true,
          method: 'email_worker',
          message: 'Email sent successfully via Cloudflare Email Worker'
        });
      }
    }

    // 📧 OPÇÃO 2: RESEND API (Recomendado - Fácil de configurar)
    if (env.RESEND_API_KEY) {
      const emailResult = await sendEmailViaResend(env, winner, message);
      if (emailResult.success) {
        await markAsNotified(env, winnerId, adminId, 'resend_api');
        return createResponse({
          success: true,
          method: 'resend_api',
          message: 'Email sent successfully via Resend'
        });
      }
    }

    // 📧 OPÇÃO 3: SENDGRID API
    if (env.SENDGRID_API_KEY) {
      const emailResult = await sendEmailViaSendGrid(env, winner, message);
      if (emailResult.success) {
        await markAsNotified(env, winnerId, adminId, 'sendgrid_api');
        return createResponse({
          success: true,
          method: 'sendgrid_api',
          message: 'Email sent successfully via SendGrid'
        });
      }
    }

    // 📧 FALLBACK: APENAS MARCAR COMO NOTIFICADO (Para você fazer manualmente)
    await markAsNotified(env, winnerId, adminId, 'manual_notification');
    
    // Salvar mensagem para você copiar e enviar manualmente
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS manual_notifications (
        id TEXT PRIMARY KEY,
        winner_id TEXT NOT NULL,
        winner_email TEXT NOT NULL,
        message TEXT NOT NULL,
        created_by TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        sent_manually BOOLEAN DEFAULT FALSE
      )
    `).run();

    await env.DB.prepare(`
      INSERT INTO manual_notifications (
        id, winner_id, winner_email, message, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      crypto.randomUUID(),
      winnerId,
      winner.user_email,
      message,
      adminId,
      Date.now()
    ).run();

    return createResponse({
      success: true,
      method: 'manual_notification',
      message: 'Winner marked as notified. Email saved for manual sending.',
      data: {
        winnerEmail: winner.user_email,
        notificationMessage: message
      }
    });

  } catch (error) {
    console.error('❌ NOTIFICATION ERROR:', error);
    return createErrorResponse('Failed to send notification: ' + error.message, 500);
  }
}

// 📧 ENVIO VIA RESEND (Recomendado - $0.40/1000 emails)
async function sendEmailViaResend(env: any, winner: any, message: string) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'ProfitShards <noreply@profitshards.online>',
        to: [winner.user_email],
        subject: `🎉 Você ganhou! ${winner.giveaway_title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; color: white;">
              <h1>🏆 PARABÉNS, VOCÊ GANHOU!</h1>
              <h2>${winner.giveaway_title}</h2>
            </div>
            <div style="padding: 20px; background: #f9f9f9;">
              <pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">${message}</pre>
            </div>
            <div style="padding: 20px; text-align: center; background: #e9ecef;">
              <p style="margin: 0; color: #666;">
                <strong>ProfitShards</strong> - WorldShards Calculator
              </p>
            </div>
          </div>
        `
      })
    });

    const result = await response.json();
    return { success: response.ok, data: result };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 📧 ENVIO VIA SENDGRID
async function sendEmailViaSendGrid(env: any, winner: any, message: string) {
  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: winner.user_email }],
          subject: `🎉 Você ganhou! ${winner.giveaway_title}`
        }],
        from: { email: 'noreply@profitshards.online', name: 'ProfitShards' },
        content: [{
          type: 'text/html',
          value: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; color: white;">
                <h1>🏆 PARABÉNS, VOCÊ GANHOU!</h1>
                <h2>${winner.giveaway_title}</h2>
              </div>
              <div style="padding: 20px; background: #f9f9f9;">
                <pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">${message}</pre>
              </div>
              <div style="padding: 20px; text-align: center; background: #e9ecef;">
                <p style="margin: 0; color: #666;">
                  <strong>ProfitShards</strong> - WorldShards Calculator
                </p>
              </div>
            </div>
          `
        }]
      })
    });

    return { success: response.ok, data: await response.text() };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 📧 CLOUDFLARE EMAIL WORKERS
async function sendEmailViaWorker(env: any, winner: any, message: string) {
  try {
    // Implementar quando Cloudflare Email Workers estiver disponível
    return { success: false, error: 'Email Workers not implemented yet' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ✅ MARCAR COMO NOTIFICADO
async function markAsNotified(env: any, winnerId: string, adminId: string, method: string) {
  try {
    await env.DB.prepare(`
      UPDATE giveaway_participants 
      SET 
        notified = TRUE,
        notification_method = ?,
        notified_by = ?,
        notified_at = ?,
        updated_at = ?
      WHERE id = ?
    `).bind(
      method,
      adminId,
      new Date().toISOString(),
      new Date().toISOString(),
      winnerId
    ).run();

    // Log de auditoria
    await logAuditEvent(
      env,
      adminId,
      'winner_notified',
      {
        winnerId,
        method,
        notifiedAt: new Date().toISOString()
      }
    );

  } catch (error) {
    console.error('Error marking as notified:', error);
  }
}