import { createResponse, createErrorResponse } from '../../_lib/response';

export async function onRequestGet(context: any) {
  try {
    const { env, request } = context;
    const url = new URL(request.url);
    const giveawayId = url.searchParams.get('giveawayId');

    // Auto-setup da tabela
    try {
      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS giveaway_participants (
          id TEXT PRIMARY KEY,
          giveaway_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          user_email TEXT,
          participated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          total_points INTEGER DEFAULT 0,
          completed_requirements TEXT DEFAULT '[]',
          is_winner BOOLEAN DEFAULT FALSE,
          winner_position INTEGER,
          winner_announced_at TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(giveaway_id, user_id)
        )
      `).run();
    } catch (setupError) {
      console.log('Tabela participants já existe:', setupError);
    }

    if (!giveawayId) {
      return createErrorResponse('Missing giveawayId parameter', 400);
    }

    // Buscar participantes
    const result = await env.DB.prepare(`
      SELECT 
        id,
        giveaway_id as giveawayId,
        user_id as userId,
        user_email as userEmail,
        participated_at as participatedAt,
        total_points as totalPoints,
        completed_requirements as completedRequirements,
        is_winner as isWinner,
        winner_position as winnerPosition,
        winner_announced_at as winnerAnnouncedAt,
        created_at as createdAt,
        updated_at as updatedAt
      FROM giveaway_participants 
      WHERE giveaway_id = ?
      ORDER BY participated_at ASC
    `).bind(giveawayId).all();

    const participants = result.results?.map(p => ({
      ...p,
      completedRequirements: p.completedRequirements ? JSON.parse(p.completedRequirements) : []
    })) || [];

    console.log('👥 PARTICIPANTES ENCONTRADOS:', participants.length);

    return createResponse({
      participants,
      total: participants.length,
      winners: participants.filter(p => p.isWinner)
    });

  } catch (error) {
    console.error('❌ ERRO:', error);
    return createErrorResponse('Failed to list participants: ' + error.message, 500);
  }
}