// API para Verificar Contato Discord
import { createResponse, createErrorResponse } from '../../_lib/response';
import { checkRateLimit, sanitizeString, logAuditEvent, getClientIP } from '../../_lib/security';

export async function onRequestPost(context: any) {
  const { request, env } = context;
  const clientIP = getClientIP(request);

  try {
    // Rate limiting para verificações
    const rateLimitResult = await checkRateLimit(env, clientIP, 'strict', request);
    if (!rateLimitResult.allowed) {
      return createErrorResponse('Too many verification attempts', 429);
    }

    const data = await request.json();
    const { 
      verificationCode, 
      discordUsername, 
      adminId, 
      adminNotes,
      winnerData // Nome, endereço, telefone do ganhador
    } = data;

    if (!verificationCode || !discordUsername || !adminId) {
      return createErrorResponse('Missing required fields', 400);
    }

    // Sanitizar dados
    const sanitizedCode = sanitizeString(verificationCode, 50);
    const sanitizedDiscordUsername = sanitizeString(discordUsername, 100);
    const sanitizedAdminNotes = adminNotes ? sanitizeString(adminNotes, 1000) : '';

    // Buscar verificação
    const verification = await env.DB.prepare(`
      SELECT * FROM discord_verifications 
      WHERE verification_code = ? AND expires_at > ? AND verified = FALSE
    `).bind(sanitizedCode, Date.now()).first();

    if (!verification) {
      return createErrorResponse('Invalid or expired verification code', 400);
    }

    // Marcar como verificado
    await env.DB.prepare(`
      UPDATE discord_verifications SET
        verified = TRUE,
        used_at = ?,
        discord_username = ?
      WHERE id = ?
    `).bind(
      Date.now(),
      sanitizedDiscordUsername,
      verification.id
    ).run();

    // Atualizar ganhador como contactado
    await env.DB.prepare(`
      UPDATE giveaway_participants SET
        discord_contacted = TRUE,
        discord_username = ?,
        contact_verified_at = ?,
        admin_notes = ?,
        updated_at = ?
      WHERE id = ?
    `).bind(
      sanitizedDiscordUsername,
      new Date().toISOString(),
      sanitizedAdminNotes,
      new Date().toISOString(),
      verification.winner_id
    ).run();

    // Salvar dados do ganhador se fornecidos
    if (winnerData) {
      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS winner_contact_data (
          id TEXT PRIMARY KEY,
          winner_id TEXT NOT NULL,
          verification_code TEXT NOT NULL,
          full_name TEXT,
          address TEXT,
          phone TEXT,
          discord_username TEXT,
          additional_info TEXT,
          collected_by TEXT NOT NULL,
          collected_at INTEGER NOT NULL
        )
      `).run();

      await env.DB.prepare(`
        INSERT INTO winner_contact_data (
          id, winner_id, verification_code, full_name, address, 
          phone, discord_username, additional_info, collected_by, collected_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        crypto.randomUUID(),
        verification.winner_id,
        sanitizedCode,
        sanitizeString(winnerData.fullName || '', 200),
        sanitizeString(winnerData.address || '', 500),
        sanitizeString(winnerData.phone || '', 50),
        sanitizedDiscordUsername,
        sanitizeString(winnerData.additionalInfo || '', 1000),
        adminId,
        Date.now()
      ).run();
    }

    // Log de auditoria
    await logAuditEvent(
      env,
      adminId,
      'discord_verification_completed',
      {
        winnerId: verification.winner_id,
        verificationCode: sanitizedCode,
        discordUsername: sanitizedDiscordUsername,
        giveawayTitle: verification.giveaway_title,
        hasContactData: !!winnerData
      },
      clientIP
    );

    return createResponse({
      success: true,
      message: 'Discord verification completed successfully',
      data: {
        winnerId: verification.winner_id,
        giveawayTitle: verification.giveaway_title,
        discordUsername: sanitizedDiscordUsername,
        verifiedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ DISCORD VERIFICATION ERROR:', error);
    return createErrorResponse('Discord verification failed: ' + error.message, 500);
  }
}

// GET endpoint para listar verificações pendentes (para admin)
export async function onRequestGet(context: any) {
  const { request, env } = context;
  const url = new URL(request.url);
  const status = url.searchParams.get('status') || 'pending';

  try {
    let query = `
      SELECT 
        v.*,
        p.user_email,
        p.winner_position
      FROM discord_verifications v
      JOIN giveaway_participants p ON v.winner_id = p.id
    `;

    if (status === 'pending') {
      query += ` WHERE v.verified = FALSE AND v.expires_at > ?`;
      const result = await env.DB.prepare(query).bind(Date.now()).all();
      return createResponse({
        success: true,
        pendingVerifications: result.results || []
      });
    } else if (status === 'completed') {
      query += ` WHERE v.verified = TRUE`;
      const result = await env.DB.prepare(query).all();
      return createResponse({
        success: true,
        completedVerifications: result.results || []
      });
    }

    return createErrorResponse('Invalid status parameter', 400);

  } catch (error) {
    console.error('❌ GET VERIFICATIONS ERROR:', error);
    return createErrorResponse('Failed to get verifications: ' + error.message, 500);
  }
}