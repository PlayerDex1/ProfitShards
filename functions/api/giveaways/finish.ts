import { createResponse, createErrorResponse } from '../../_lib/response';

export async function onRequestPost(context: any) {
  try {
    const { env, request } = context;
    const { giveawayId } = await request.json();

    if (!giveawayId) {
      return createErrorResponse('Giveaway ID is required', 400);
    }

    // Auto-setup da tabela (caso não exista)
    try {
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
      console.log('Tabela giveaways já existe:', setupError);
    }

    console.log('🔴 FINALIZANDO GIVEAWAY:', giveawayId);

    // Verificar se o giveaway existe
    const existingGiveaway = await env.DB.prepare(`
      SELECT * FROM giveaways WHERE id = ?
    `).bind(giveawayId).first();

    if (!existingGiveaway) {
      return createErrorResponse('Giveaway not found', 404);
    }

    console.log('📋 GIVEAWAY ENCONTRADO:', existingGiveaway.title);

    // Atualizar status para "finished"
    const result = await env.DB.prepare(`
      UPDATE giveaways 
      SET status = 'finished', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(giveawayId).run();

    if (result.success) {
      console.log('✅ GIVEAWAY FINALIZADO:', giveawayId);
      
      return createResponse({
        success: true,
        message: 'Giveaway finished successfully',
        giveawayId,
        previousStatus: existingGiveaway.status,
        newStatus: 'finished'
      });
    } else {
      console.error('❌ ERRO NA ATUALIZAÇÃO:', result);
      return createErrorResponse('Failed to update giveaway status', 500);
    }

  } catch (error) {
    console.error('❌ ERRO AO FINALIZAR GIVEAWAY:', error);
    return createErrorResponse('Failed to finish giveaway: ' + error.message, 500);
  }
}