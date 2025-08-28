import { createResponse, createErrorResponse } from '../../_lib/response';

export async function onRequestPost(context: any) {
  try {
    const { request, env } = context;
    const data = await request.json();
    const { giveawayId, winnerCount = 1 } = data;

    console.log('🎲 INICIANDO SORTEIO:', { giveawayId, winnerCount });

    if (!giveawayId) {
      return createErrorResponse('Missing giveawayId', 400);
    }

    // Buscar participantes elegíveis (não ganhadores ainda)
    const result = await env.DB.prepare(`
      SELECT 
        id, user_id, user_email, total_points, participated_at
      FROM giveaway_participants 
      WHERE giveaway_id = ? AND is_winner = FALSE
      ORDER BY participated_at ASC
    `).bind(giveawayId).all();

    const eligibleParticipants = result.results || [];

    if (eligibleParticipants.length === 0) {
      return createErrorResponse('No eligible participants found', 400);
    }

    if (winnerCount > eligibleParticipants.length) {
      return createErrorResponse(`Only ${eligibleParticipants.length} participants available`, 400);
    }

    console.log('🎯 PARTICIPANTES ELEGÍVEIS:', eligibleParticipants.length);

    // Realizar sorteio aleatório
    const winners = [];
    const participantsCopy = [...eligibleParticipants];
    
    for (let i = 0; i < winnerCount; i++) {
      const randomIndex = Math.floor(Math.random() * participantsCopy.length);
      const winner = participantsCopy.splice(randomIndex, 1)[0];
      winners.push({
        ...winner,
        position: i + 1,
        drawnAt: new Date().toISOString()
      });
    }

    console.log('🏆 GANHADORES SORTEADOS:', winners.map(w => ({
      userId: w.user_id?.slice(0, 10),
      position: w.position
    })));

    // Atualizar banco com ganhadores
    const now = new Date().toISOString();
    const updatePromises = winners.map(winner => 
      env.DB.prepare(`
        UPDATE giveaway_participants SET
          is_winner = TRUE,
          winner_position = ?,
          winner_announced_at = ?,
          updated_at = ?
        WHERE id = ?
      `).bind(
        winner.position,
        winner.drawnAt,
        now,
        winner.id
      ).run()
    );

    await Promise.all(updatePromises);

    // Buscar dados completos dos ganhadores
    const winnerIds = winners.map(w => w.id);
    const winnersData = await env.DB.prepare(`
      SELECT 
        id, user_id as userId, user_email as userEmail, 
        total_points as totalPoints, winner_position as position,
        winner_announced_at as announcedAt
      FROM giveaway_participants 
      WHERE id IN (${winnerIds.map(() => '?').join(',')})
      ORDER BY winner_position ASC
    `).bind(...winnerIds).all();

    console.log('✅ SORTEIO CONCLUÍDO:', winnersData.results?.length || 0, 'ganhadores');

    // Salvar no histórico de sorteios
    await saveLotteryHistory(env, giveawayId, winnerCount, winnersData.results || [], eligibleParticipants.length, now);

    return createResponse({
      success: true,
      message: `${winnerCount} winner(s) drawn successfully`,
      winners: winnersData.results || [],
      drawnAt: now,
      totalParticipants: eligibleParticipants.length
    });

  } catch (error) {
    console.error('❌ ERRO NO SORTEIO:', error);
    return createErrorResponse('Failed to draw winners: ' + error.message, 500);
  }
}

// Função para salvar sorteio no histórico
async function saveLotteryHistory(
  env: any, 
  giveawayId: string, 
  winnerCount: number, 
  winners: any[], 
  totalParticipants: number, 
  drawnAt: string
) {
  try {
    // Auto-setup da tabela de histórico
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

    // Buscar título do giveaway
    const giveaway = await env.DB.prepare(`
      SELECT title FROM giveaways WHERE id = ?
    `).bind(giveawayId).first();

    const historyId = `lottery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Inserir no histórico
    await env.DB.prepare(`
      INSERT INTO lottery_history (
        id, giveaway_id, giveaway_title, total_participants, 
        winners_count, winners_data, drawn_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      historyId,
      giveawayId,
      giveaway?.title || 'Giveaway Desconhecido',
      totalParticipants,
      winnerCount,
      JSON.stringify(winners),
      drawnAt,
      drawnAt
    ).run();

    console.log('📜 HISTÓRICO SALVO:', historyId);
  } catch (error) {
    console.error('❌ ERRO AO SALVAR HISTÓRICO:', error);
  }
}