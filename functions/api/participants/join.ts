import { createResponse, createErrorResponse } from '../../_lib/response';

export async function onRequestPost(context: any) {
  try {
    const { request, env } = context;

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

    const data = await request.json();
    const { giveawayId, userId, userEmail, totalPoints, completedRequirements } = data;

    console.log('📝 NOVA PARTICIPAÇÃO:', {
      giveawayId, userId: userId?.slice(0, 10), totalPoints
    });

    if (!giveawayId || !userId) {
      return createErrorResponse('Missing required fields', 400);
    }

    const participantId = `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    // Verificar se já está participando
    const existing = await env.DB.prepare(`
      SELECT id FROM giveaway_participants 
      WHERE giveaway_id = ? AND user_id = ?
    `).bind(giveawayId, userId).first();

    if (existing) {
      // Atualizar participação existente
      await env.DB.prepare(`
        UPDATE giveaway_participants SET
          total_points = ?,
          completed_requirements = ?,
          updated_at = ?
        WHERE giveaway_id = ? AND user_id = ?
      `).bind(
        totalPoints || 0,
        JSON.stringify(completedRequirements || []),
        now,
        giveawayId,
        userId
      ).run();

      console.log('✅ PARTICIPAÇÃO ATUALIZADA:', existing.id);
      
      return createResponse({
        success: true,
        message: 'Participation updated',
        participantId: existing.id
      });
    }

    // Criar nova participação
    const result = await env.DB.prepare(`
      INSERT INTO giveaway_participants (
        id, giveaway_id, user_id, user_email, participated_at,
        total_points, completed_requirements, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      participantId,
      giveawayId,
      userId,
      userEmail || '',
      now,
      totalPoints || 0,
      JSON.stringify(completedRequirements || []),
      now,
      now
    ).run();

    console.log('🎉 NOVA PARTICIPAÇÃO CRIADA:', {
      success: result.success,
      participantId
    });

    // Atualizar contador no giveaway
    await updateGiveawayParticipantCount(env, giveawayId);

    return createResponse({
      success: true,
      message: 'Participation created successfully',
      participantId
    });

  } catch (error) {
    console.error('❌ ERRO:', error);
    return createErrorResponse('Failed to join giveaway: ' + error.message, 500);
  }
}

// Função auxiliar para atualizar contador
async function updateGiveawayParticipantCount(env: any, giveawayId: string) {
  try {
    // Contar participantes
    const countResult = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM giveaway_participants 
      WHERE giveaway_id = ?
    `).bind(giveawayId).first();

    const participantCount = countResult?.count || 0;

    // Atualizar giveaway
    await env.DB.prepare(`
      UPDATE giveaways SET 
        current_participants = ?,
        updated_at = ?
      WHERE id = ?
    `).bind(
      participantCount,
      new Date().toISOString(),
      giveawayId
    ).run();

    console.log('📊 CONTADOR ATUALIZADO:', participantCount);
  } catch (error) {
    console.error('Erro ao atualizar contador:', error);
  }
}