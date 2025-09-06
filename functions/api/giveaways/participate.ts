import { createResponse, createErrorResponse } from '../../_lib/response';

export async function onRequestPost(context: any) {
  try {
    const { env, request } = context;
    
    console.log('🎯 PARTICIPATE GIVEAWAY: Iniciando...');
    
    if (!env.DB) {
      console.log('❌ D1 Database não disponível');
      return createErrorResponse('Database not available', 500);
    }

    // Verificar autenticação
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) {
      console.log('❌ Cookie não encontrado');
      return createErrorResponse('Unauthorized', 401);
    }

    const sessionCookie = cookieHeader
      .split(';')
      .find(c => c.trim().startsWith('ps_session='))
      ?.split('=')[1];

    if (!sessionCookie) {
      console.log('❌ Session cookie não encontrado');
      return createErrorResponse('Session not found', 401);
    }

    // Obter email do usuário
    const userEmail = sessionCookie.split('|')[0];
    if (!userEmail) {
      console.log('❌ Email do usuário não encontrado');
      return createErrorResponse('User email not found', 401);
    }

    // Obter dados da requisição
    const { giveawayId } = await request.json();
    
    if (!giveawayId) {
      return createErrorResponse('Giveaway ID is required', 400);
    }

    console.log('🔍 Dados recebidos:', { giveawayId, userEmail });

    // Verificar se o giveaway existe e está ativo
    const giveaway = await env.DB.prepare(`
      SELECT id, title, status, max_participants, current_participants, start_date, end_date
      FROM giveaways 
      WHERE id = ? AND status = 'active'
    `).bind(giveawayId).first();

    if (!giveaway) {
      console.log('❌ Giveaway não encontrado ou inativo:', giveawayId);
      return createErrorResponse('Giveaway not found or inactive', 404);
    }

    // Verificar se o giveaway ainda está no prazo
    const now = Date.now();
    const startDate = new Date(giveaway.start_date).getTime();
    const endDate = new Date(giveaway.end_date).getTime();

    if (now < startDate) {
      return createErrorResponse('Giveaway has not started yet', 400);
    }

    if (now > endDate) {
      return createErrorResponse('Giveaway has ended', 400);
    }

    // Verificar se já atingiu o limite de participantes
    if (giveaway.max_participants && giveaway.current_participants >= giveaway.max_participants) {
      return createErrorResponse('Giveaway is full', 400);
    }

    // Verificar se o usuário já participou
    const existingParticipation = await env.DB.prepare(`
      SELECT id FROM giveaway_participants 
      WHERE giveaway_id = ? AND user_email = ?
    `).bind(giveawayId, userEmail).first();

    if (existingParticipation) {
      console.log('⚠️ Usuário já participou:', userEmail);
      return createErrorResponse('You have already participated in this giveaway', 400);
    }

    // Garantir que a tabela de participantes existe
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS giveaway_participants (
        id TEXT PRIMARY KEY,
        giveaway_id TEXT NOT NULL,
        user_email TEXT NOT NULL,
        username TEXT,
        participation_date INTEGER NOT NULL,
        is_winner INTEGER DEFAULT 0,
        winner_position INTEGER,
        total_points INTEGER DEFAULT 0,
        UNIQUE(giveaway_id, user_email)
      )
    `).run();

    // Inserir participação
    const participantId = `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const participationDate = Date.now();

    await env.DB.prepare(`
      INSERT INTO giveaway_participants (id, giveaway_id, user_email, participation_date)
      VALUES (?, ?, ?, ?)
    `).bind(participantId, giveawayId, userEmail, participationDate).run();

    // Atualizar contador de participantes
    await env.DB.prepare(`
      UPDATE giveaways 
      SET current_participants = current_participants + 1
      WHERE id = ?
    `).bind(giveawayId).run();

    console.log(`✅ Participação registrada: ${participantId} para ${userEmail}`);

    return createResponse({
      success: true,
      message: 'Participation registered successfully',
      data: {
        participantId,
        giveawayId,
        userEmail,
        participationDate: new Date(participationDate).toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Erro ao registrar participação:', error);
    return createErrorResponse('Internal server error', 500);
  }
}