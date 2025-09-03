import { createResponse, createErrorResponse } from '../../_lib/response';

export async function onRequestPost(context: any) {
  try {
    const { env, request } = context;
    
    // Verificar se é POST
    if (request.method !== 'POST') {
      return createErrorResponse('Method not allowed', 405);
    }

    const body = await request.json();
    const { 
      giveawayId, 
      userId, 
      userEmail, 
      totalPoints, 
      winnerPosition,
      giveawayTitle,
      prize 
    } = body;

    // Validação dos campos obrigatórios
    if (!giveawayId || !userId || !winnerPosition) {
      return createErrorResponse('Missing required fields: giveawayId, userId, winnerPosition', 400);
    }

    console.log('🎯 INSERINDO NOVO GANHADOR:', {
      giveawayId,
      userId,
      userEmail,
      winnerPosition,
      giveawayTitle,
      prize
    });

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

    // Verificar se o giveaway existe, se não, criar
    const existingGiveaway = await env.DB.prepare(`
      SELECT id FROM giveaways WHERE id = ?
    `).bind(giveawayId).first();

    if (!existingGiveaway) {
      console.log('📝 Criando giveaway inexistente:', giveawayId);
      
      await env.DB.prepare(`
        INSERT INTO giveaways (id, title, prize, start_date, end_date, status)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'finished')
      `).bind(giveawayId, giveawayTitle || 'Giveaway', prize || 'Prêmio').run();
    }

    // Gerar ID único para o participante
    const participantId = `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    // Inserir novo ganhador
    const insertResult = await env.DB.prepare(`
      INSERT INTO giveaway_participants (
        id, 
        giveaway_id, 
        user_id, 
        user_email, 
        total_points, 
        is_winner, 
        winner_position, 
        winner_announced_at,
        participated_at
      ) VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)
    `).bind(
      participantId,
      giveawayId,
      userId,
      userEmail || null,
      totalPoints || 0,
      winnerPosition,
      now,
      now
    ).run();

    console.log('✅ GANHADOR INSERIDO COM SUCESSO:', {
      participantId,
      giveawayId,
      userId,
      winnerPosition,
      announcedAt: now
    });

    // Buscar o ganhador inserido para retornar
    const newWinner = await env.DB.prepare(`
      SELECT 
        p.id,
        p.giveaway_id as giveawayId,
        p.user_id as userId,
        p.user_email as userEmail,
        p.total_points as totalPoints,
        p.winner_position as position,
        p.winner_announced_at as announcedAt,
        g.title as giveawayTitle,
        g.prize as prize,
        g.status as giveawayStatus
      FROM giveaway_participants p
      JOIN giveaways g ON p.giveaway_id = g.id
      WHERE p.id = ?
    `).bind(participantId).first();

    // Disparar evento customizado para atualizar o frontend
    console.log('🎉 NOVO GANHADOR INSERIDO - Disparando eventos...');

    return createResponse({
      success: true,
      message: 'Ganhador inserido com sucesso',
      winner: newWinner,
      participantId
    });

  } catch (error) {
    console.error('❌ ERRO AO INSERIR GANHADOR:', error);
    return createErrorResponse('Failed to insert winner: ' + error.message, 500);
  }
}