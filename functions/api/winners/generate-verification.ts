// API para Gerar Código de Verificação Discord
import { createResponse, createErrorResponse } from '../../_lib/response';
import { checkRateLimit, sanitizeString, logAuditEvent, getClientIP } from '../../_lib/security';

export async function onRequestPost(context: any) {
  const { request, env } = context;
  const clientIP = getClientIP(request);

  try {
    // Rate limiting
    const rateLimitResult = await checkRateLimit(env, clientIP, 'api', request);
    if (!rateLimitResult.allowed) {
      return createErrorResponse('Too many requests', 429);
    }

    const data = await request.json();
    const { winnerId, adminId } = data;

    if (!winnerId || !adminId) {
      return createErrorResponse('Missing required fields', 400);
    }

    // Buscar dados do ganhador
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
      WHERE p.id = ? AND p.is_winner = 1
    `).bind(winnerId).first();

    if (!winner) {
      return createErrorResponse('Winner not found', 404);
    }

    // Gerar código único de verificação
    const verificationCode = generateVerificationCode(winner.id, winner.user_id);
    
    // Salvar código no banco
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS discord_verifications (
        id TEXT PRIMARY KEY,
        winner_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        verification_code TEXT NOT NULL,
        giveaway_title TEXT NOT NULL,
        prize TEXT NOT NULL,
        generated_by TEXT NOT NULL,
        generated_at INTEGER NOT NULL,
        used_at INTEGER,
        discord_username TEXT,
        verified BOOLEAN DEFAULT FALSE,
        expires_at INTEGER NOT NULL
      )
    `).run();

    const verificationId = crypto.randomUUID();
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 dias

    await env.DB.prepare(`
      INSERT INTO discord_verifications (
        id, winner_id, user_id, verification_code, giveaway_title,
        prize, generated_by, generated_at, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      verificationId,
      winner.id,
      winner.user_id,
      verificationCode,
      winner.giveaway_title,
      winner.prize,
      adminId,
      Date.now(),
      expiresAt
    ).run();

    // Log de auditoria
    await logAuditEvent(
      env,
      adminId,
      'discord_verification_generated',
      {
        winnerId: winner.id,
        verificationCode,
        giveawayTitle: winner.giveaway_title,
        expiresAt
      },
      clientIP
    );

    return createResponse({
      success: true,
      verificationCode,
      instructions: {
        discord: `@playerhold`,
        message: `Envie esta mensagem no Discord:\n\n🏆 GANHADOR VERIFICAÇÃO\nCódigo: ${verificationCode}\nNome: [SEU NOME COMPLETO]\nEndereço: [SEU ENDEREÇO COMPLETO]\nTelefone: [SEU TELEFONE]`,
        expiresIn: '7 dias'
      },
      data: {
        winnerEmail: winner.user_email,
        giveawayTitle: winner.giveaway_title,
        prize: winner.prize,
        position: winner.winner_position
      }
    });

  } catch (error) {
    console.error('❌ VERIFICATION CODE ERROR:', error);
    return createErrorResponse('Failed to generate verification code: ' + error.message, 500);
  }
}

// 🔑 GERAR CÓDIGO ÚNICO E SEGURO
function generateVerificationCode(winnerId: string, userId: string): string {
  const timestamp = Date.now().toString();
  const winnerHash = winnerId.slice(-6);
  const userHash = userId.slice(-4);
  const randomPart = Math.random().toString(36).substr(2, 4).toUpperCase();
  
  return `PS-${winnerHash}-${userHash}-${randomPart}`;
}

// Endpoint GET para verificar código (para você usar)
export async function onRequestGet(context: any) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return createErrorResponse('Verification code is required', 400);
  }

  try {
    // Buscar verificação pelo código
    const verification = await env.DB.prepare(`
      SELECT 
        v.*,
        p.user_email
      FROM discord_verifications v
      JOIN giveaway_participants p ON v.winner_id = p.id
      WHERE v.verification_code = ? AND v.expires_at > ?
    `).bind(code, Date.now()).first();

    if (!verification) {
      return createResponse({
        success: false,
        valid: false,
        message: 'Código inválido ou expirado'
      });
    }

    return createResponse({
      success: true,
      valid: true,
      data: {
        giveawayTitle: verification.giveaway_title,
        prize: verification.prize,
        userEmail: verification.user_email,
        verified: verification.verified,
        generatedAt: new Date(verification.generated_at).toLocaleString('pt-BR'),
        expiresAt: new Date(verification.expires_at).toLocaleString('pt-BR')
      }
    });

  } catch (error) {
    console.error('❌ CODE CHECK ERROR:', error);
    return createErrorResponse('Failed to check code: ' + error.message, 500);
  }
}