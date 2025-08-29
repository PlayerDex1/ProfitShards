// API para Conectar Discord do Ganhador
import { createResponse, createErrorResponse } from '../../_lib/response';
import { checkRateLimit, sanitizeString, logAuditEvent, getClientIP } from '../../_lib/security';

export async function onRequestPost(context: any) {
  const { request, env } = context;
  const clientIP = getClientIP(request);

  try {
    // Rate limiting
    const rateLimitResult = await checkRateLimit(env, clientIP, 'api', request);
    if (!rateLimitResult.allowed) {
      return createErrorResponse('Too many attempts', 429);
    }

    const data = await request.json();
    const { userId, discordUsername, giveawayId, fullName, address, phone } = data;

    if (!userId || !discordUsername) {
      return createErrorResponse('User ID and Discord username are required', 400);
    }

    // Sanitizar dados
    const sanitizedUserId = sanitizeString(userId, 100);
    const sanitizedDiscordUsername = sanitizeString(discordUsername, 100);
    const sanitizedFullName = fullName ? sanitizeString(fullName, 200) : '';
    const sanitizedAddress = address ? sanitizeString(address, 500) : '';
    const sanitizedPhone = phone ? sanitizeString(phone, 50) : '';

    // Validar formato Discord username
    const discordRegex = /^.{2,32}#[0-9]{4}$|^.{2,32}$/;
    if (!discordRegex.test(sanitizedDiscordUsername)) {
      return createErrorResponse('Invalid Discord username format', 400);
    }

    // Verificar se usuário é realmente ganhador
    const winner = await env.DB.prepare(`
      SELECT 
        p.id,
        p.user_id,
        p.user_email,
        p.total_points,
        p.winner_position,
        g.title as giveaway_title,
        g.prize
      FROM giveaway_participants p
      JOIN giveaways g ON p.giveaway_id = g.id
      WHERE p.user_id = ? AND p.is_winner = 1
      ${giveawayId ? 'AND p.giveaway_id = ?' : ''}
      ORDER BY p.winner_announced_at DESC
      LIMIT 1
    `).bind(sanitizedUserId, ...(giveawayId ? [giveawayId] : [])).first();

    if (!winner) {
      return createErrorResponse('You are not a winner or winner not found', 403);
    }

    // Criar tabela para dados de contato Discord
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS winner_discord_contacts (
        id TEXT PRIMARY KEY,
        winner_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        giveaway_id TEXT NOT NULL,
        discord_username TEXT NOT NULL,
        full_name TEXT,
        address TEXT,
        phone TEXT,
        connected_at INTEGER NOT NULL,
        admin_contacted BOOLEAN DEFAULT FALSE,
        admin_contacted_at INTEGER,
        prize_sent BOOLEAN DEFAULT FALSE,
        prize_sent_at INTEGER,
        notes TEXT,
        UNIQUE(winner_id)
      )
    `).run();

    // Salvar dados de contato
    const contactId = crypto.randomUUID();
    await env.DB.prepare(`
      INSERT OR REPLACE INTO winner_discord_contacts (
        id, winner_id, user_id, giveaway_id, discord_username,
        full_name, address, phone, connected_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      contactId,
      winner.id,
      sanitizedUserId,
      winner.giveaway_id || 'unknown',
      sanitizedDiscordUsername,
      sanitizedFullName,
      sanitizedAddress,
      sanitizedPhone,
      Date.now()
    ).run();

    // Atualizar participante como "Discord conectado"
    await env.DB.prepare(`
      UPDATE giveaway_participants SET
        discord_connected = TRUE,
        discord_username = ?,
        contact_data_provided = TRUE,
        updated_at = ?
      WHERE id = ?
    `).bind(
      sanitizedDiscordUsername,
      new Date().toISOString(),
      winner.id
    ).run();

    // 📢 NOTIFICAR ADMIN (VIA WEBHOOK OU EMAIL)
    await notifyAdminNewDiscordContact(env, {
      winnerEmail: winner.user_email,
      discordUsername: sanitizedDiscordUsername,
      giveawayTitle: winner.giveaway_title,
      prize: winner.prize,
      position: winner.winner_position,
      fullName: sanitizedFullName,
      address: sanitizedAddress,
      phone: sanitizedPhone,
      contactId
    });

    // Log de auditoria
    await logAuditEvent(
      env,
      sanitizedUserId,
      'discord_connected_by_winner',
      {
        winnerId: winner.id,
        discordUsername: sanitizedDiscordUsername,
        giveawayTitle: winner.giveaway_title,
        hasContactData: !!(sanitizedFullName || sanitizedAddress || sanitizedPhone)
      },
      clientIP
    );

    return createResponse({
      success: true,
      message: 'Discord connected successfully! You will be contacted soon.',
      data: {
        contactId,
        discordUsername: sanitizedDiscordUsername,
        giveawayTitle: winner.giveaway_title,
        prize: winner.prize,
        estimatedContact: '24-48 hours'
      }
    });

  } catch (error) {
    console.error('❌ DISCORD CONNECT ERROR:', error);
    return createErrorResponse('Failed to connect Discord: ' + error.message, 500);
  }
}

// 📢 NOTIFICAR ADMIN SOBRE NOVO CONTATO DISCORD
async function notifyAdminNewDiscordContact(env: any, data: any) {
  try {
    // Salvar notificação para admin
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS admin_notifications (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        data TEXT NOT NULL,
        read BOOLEAN DEFAULT FALSE,
        created_at INTEGER NOT NULL
      )
    `).run();

    const notificationId = crypto.randomUUID();
    await env.DB.prepare(`
      INSERT INTO admin_notifications (
        id, type, title, message, data, created_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      notificationId,
      'new_discord_contact',
      `🏆 Novo ganhador conectou Discord`,
      `${data.winnerEmail} conectou Discord: ${data.discordUsername}\nGiveaway: ${data.giveawayTitle}\nPrêmio: ${data.prize}\nPosição: #${data.position}`,
      JSON.stringify(data),
      Date.now()
    ).run();

    console.log('📢 ADMIN NOTIFICADO:', {
      type: 'new_discord_contact',
      winnerEmail: data.winnerEmail,
      discordUsername: data.discordUsername
    });

  } catch (error) {
    console.error('Failed to notify admin:', error);
  }
}

// GET endpoint para admin ver contatos Discord pendentes
export async function onRequestGet(context: any) {
  const { request, env } = context;
  
  try {
    const contacts = await env.DB.prepare(`
      SELECT 
        wdc.*,
        p.user_email,
        g.title as giveaway_title,
        g.prize
      FROM winner_discord_contacts wdc
      JOIN giveaway_participants p ON wdc.winner_id = p.id
      JOIN giveaways g ON wdc.giveaway_id = g.id
      ORDER BY wdc.connected_at DESC
    `).all();

    return createResponse({
      success: true,
      contacts: contacts.results || [],
      totalContacts: contacts.results?.length || 0
    });

  } catch (error) {
    console.error('❌ GET CONTACTS ERROR:', error);
    return createErrorResponse('Failed to get contacts: ' + error.message, 500);
  }
}