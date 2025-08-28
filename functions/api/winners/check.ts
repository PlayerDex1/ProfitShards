import { createResponse, createErrorResponse } from '../../_lib/response';

export async function onRequestGet(context: any) {
  try {
    const { env, request } = context;
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const userEmail = url.searchParams.get('userEmail');

    if (!userId && !userEmail) {
      return createErrorResponse('User ID or email is required', 400);
    }

    // Auto-setup das tabelas
    try {
      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS giveaway_participants (
          id TEXT PRIMARY KEY,
          giveaway_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          user_email TEXT,
          total_points INTEGER DEFAULT 0,
          completed_requirements TEXT,
          participated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          is_winner INTEGER DEFAULT 0,
          winner_position INTEGER,
          winner_announced_at TEXT
        )
      `).run();

      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS giveaways (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          prize TEXT NOT NULL,
          start_date TEXT NOT NULL,
          end_date TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'active',
          max_participants INTEGER DEFAULT 100,
          current_participants INTEGER DEFAULT 0,
          rules TEXT,
          requirements TEXT,
          winner_announcement TEXT,
          image_url TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `).run();
    } catch (setupError) {
      console.log('Tabelas já existem:', setupError);
    }

    // Buscar ganhadores do usuário
    let query = `
      SELECT 
        p.id,
        p.giveaway_id as giveawayId,
        p.user_id as userId,
        p.user_email as userEmail,
        p.total_points as totalPoints,
        p.winner_position as position,
        p.winner_announced_at as announcedAt,
        g.title as giveawayTitle,
        g.description as giveawayDescription,
        g.prize as prize,
        g.status as giveawayStatus,
        g.winner_announcement as winnerAnnouncement
      FROM giveaway_participants p
      JOIN giveaways g ON p.giveaway_id = g.id
      WHERE p.is_winner = 1
    `;

    const params = [];

    if (userId && userEmail) {
      query += ` AND (p.user_id = ? OR p.user_email = ?)`;
      params.push(userId, userEmail);
    } else if (userId) {
      query += ` AND p.user_id = ?`;
      params.push(userId);
    } else {
      query += ` AND p.user_email = ?`;
      params.push(userEmail);
    }

    query += ` ORDER BY p.winner_announced_at DESC`;

    const result = await env.DB.prepare(query).bind(...params).all();

    const winnings = result.results || [];

    console.log('🏆 VERIFICAÇÃO DE GANHADOR:', {
      userId,
      userEmail,
      totalWinnings: winnings.length
    });

    // Separar por status
    const activeWinnings = winnings.filter(w => ['active', 'finished'].includes(w.giveawayStatus));
    const latestWinning = activeWinnings[0] || null;

    return createResponse({
      isWinner: winnings.length > 0,
      totalWinnings: winnings.length,
      latestWinning,
      allWinnings: winnings,
      userId,
      userEmail
    });

  } catch (error) {
    console.error('❌ ERRO AO VERIFICAR GANHADOR:', error);
    return createErrorResponse('Failed to check winner status: ' + error.message, 500);
  }
}