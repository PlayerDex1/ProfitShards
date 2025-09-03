import { createResponse, createErrorResponse } from '../../_lib/response';

export async function onRequestGet(context: any) {
  try {
    const { env, request } = context;
    const url = new URL(request.url);
    const giveawayId = url.searchParams.get('giveawayId');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const isAdmin = url.searchParams.get('admin') === 'true';

    // Auto-setup das tabelas com campos de notificação
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
          winner_announced_at TEXT,
          notified BOOLEAN DEFAULT FALSE,
          notification_method TEXT,
          notified_by TEXT,
          notified_at TEXT,
          claimed BOOLEAN DEFAULT FALSE,
          claimed_at TEXT,
          claimed_by TEXT,
          shipping_status TEXT DEFAULT 'pending',
          tracking_code TEXT,
          shipped_at TEXT,
          shipped_by TEXT
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

    // Query para buscar ganhadores (completo para admin, mascarado para público)
    let query = `
      SELECT 
        p.id,
        p.giveaway_id as giveawayId,
        ${isAdmin ? 'p.user_id as userId' : 'SUBSTR(p.user_id, 1, 8) || \'***\' as userId'},
        ${isAdmin ? 'p.user_email as userEmail' : `CASE 
          WHEN p.user_email IS NOT NULL AND p.user_email != '' 
          THEN SUBSTR(p.user_email, 1, 3) || '***@' || SUBSTR(p.user_email, INSTR(p.user_email, '@') + 1)
          ELSE NULL 
        END as userEmail`},
        p.total_points as totalPoints,
        p.winner_position as position,
        p.winner_announced_at as announcedAt,
        p.notified as notified,
        p.notification_method as notificationMethod,
        p.notified_at as notifiedAt,
        p.claimed as claimed,
        p.claimed_at as claimedAt,
        p.shipping_status as shippingStatus,
        p.tracking_code as trackingCode,
        p.shipped_at as shippedAt,
        g.title as giveawayTitle,
        g.prize as prize,
        g.status as giveawayStatus
      FROM giveaway_participants p
      JOIN giveaways g ON p.giveaway_id = g.id
      WHERE p.is_winner = 1
    `;

    const params = [];

    if (giveawayId) {
      query += ` AND p.giveaway_id = ?`;
      params.push(giveawayId);
    }

    query += ` ORDER BY p.winner_announced_at DESC, p.winner_position ASC LIMIT ?`;
    params.push(limit);

    const result = await env.DB.prepare(query).bind(...params).all();

    const winners = result.results || [];

    console.log('🎖️ GANHADORES PÚBLICOS:', winners.length);
    
    // Log dos ganhadores mais recentes para debug
    if (winners.length > 0) {
      const latest = winners[0];
      console.log('🥇 GANHADOR MAIS RECENTE:', {
        id: latest.id,
        giveaway: latest.giveawayTitle,
        prize: latest.prize,
        announcedAt: latest.announcedAt,
        position: latest.position
      });
    }

    // Estatísticas
    const stats = {
      totalWinners: winners.length,
      giveaways: [...new Set(winners.map(w => w.giveawayId))].length,
      totalPrizes: [...new Set(winners.map(w => w.prize))].length,
      latestWinner: winners[0] || null,
      notifiedCount: winners.filter(w => w.notified).length,
      claimedCount: winners.filter(w => w.claimed).length
    };

    return createResponse({
      winners,
      stats,
      giveawayId: giveawayId || 'all'
    });

  } catch (error) {
    console.error('❌ ERRO AO BUSCAR GANHADORES PÚBLICOS:', error);
    return createErrorResponse('Failed to fetch public winners: ' + error.message, 500);
  }
}