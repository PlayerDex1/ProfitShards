import { createResponse, createErrorResponse } from '../../_lib/response';

export async function onRequestGet(context: any) {
  try {
    const { env, request } = context;
    const url = new URL(request.url);
    const giveawayId = url.searchParams.get('giveawayId');
    const limit = parseInt(url.searchParams.get('limit') || '50');

    // Auto-setup da tabela
    try {
      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS lottery_history (
          id TEXT PRIMARY KEY,
          giveaway_id TEXT NOT NULL,
          giveaway_title TEXT NOT NULL,
          total_participants INTEGER NOT NULL,
          winners_count INTEGER NOT NULL,
          winners_data TEXT NOT NULL,
          drawn_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          drawn_by TEXT,
          notes TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `).run();
    } catch (setupError) {
      console.log('Tabela lottery_history já existe:', setupError);
    }

    let query = `
      SELECT 
        id,
        giveaway_id as giveawayId,
        giveaway_title as giveawayTitle,
        total_participants as totalParticipants,
        winners_count as winnersCount,
        winners_data as winnersData,
        drawn_at as drawnAt,
        drawn_by as drawnBy,
        notes,
        created_at as createdAt
      FROM lottery_history
    `;

    const params = [];

    if (giveawayId) {
      query += ` WHERE giveaway_id = ?`;
      params.push(giveawayId);
    }

    query += ` ORDER BY drawn_at DESC LIMIT ?`;
    params.push(limit);

    const result = await env.DB.prepare(query).bind(...params).all();

    const history = result.results?.map(entry => ({
      ...entry,
      winnersData: entry.winnersData ? JSON.parse(entry.winnersData) : []
    })) || [];

    console.log('📜 HISTÓRICO ENCONTRADO:', history.length, 'entradas');

    return createResponse({
      history,
      total: history.length,
      giveawayId: giveawayId || 'all'
    });

  } catch (error) {
    console.error('❌ ERRO:', error);
    return createErrorResponse('Failed to fetch lottery history: ' + error.message, 500);
  }
}