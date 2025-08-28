import { createResponse, createErrorResponse } from '../../_lib/response';

export async function onRequestPost(context: any) {
  const { request, env } = context;

  try {
    // Auto-setup da tabela
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS giveaways (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        prize TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        max_participants INTEGER DEFAULT 100,
        current_participants INTEGER DEFAULT 0,
        rules TEXT DEFAULT '[]',
        requirements TEXT DEFAULT '[]',
        winner_announcement TEXT DEFAULT '',
        image_url TEXT DEFAULT '',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
  } catch (setupError) {
    console.log('Tabela já existe ou erro menor:', setupError);
  }

  try {
    const data = await request.json();
    console.log('📋 DADOS RECEBIDOS:', JSON.stringify(data, null, 2));
    
    const {
      id,
      title,
      description,
      prize,
      startDate,
      endDate,
      status,
      maxParticipants,
      currentParticipants = 0,
      rules = [],
      requirements = [],
      winnerAnnouncement,
      imageUrl
    } = data;

    // Validações básicas
    if (!title || !description || !prize || !startDate || !endDate) {
      return createErrorResponse('Missing required fields', 400);
    }

    const now = new Date().toISOString();
    const newId = id || `giveaway_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('➕ CRIANDO GIVEAWAY:', {
      newId, title, description, prize, startDate, endDate, status
    });
    
    // INSERT no banco
    const result = await env.DB.prepare(`
      INSERT INTO giveaways (
        id, title, description, prize, start_date, end_date, status,
        max_participants, current_participants, rules, requirements,
        winner_announcement, image_url, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      newId,
      title,
      description,
      prize,
      startDate,
      endDate,
      status || 'active',
      maxParticipants || 100,
      currentParticipants,
      JSON.stringify(rules),
      JSON.stringify(requirements),
      winnerAnnouncement || '',
      imageUrl || '',
      now,
      now
    ).run();
    
    console.log('✅ RESULTADO INSERT:', {
      success: result.success,
      changes: result.changes,
      lastRowId: result.meta?.last_row_id
    });

    // Se ativo, desativar outros
    if ((status || 'active') === 'active') {
      await env.DB.prepare(`
        UPDATE giveaways SET status = 'ended', updated_at = ?
        WHERE id != ? AND status = 'active'
      `).bind(now, newId).run();
    }

    return createResponse({ 
      success: true, 
      message: 'Giveaway created successfully',
      id: newId 
    });

  } catch (error) {
    console.error('❌ ERRO:', error);
    return createErrorResponse('Failed to save giveaway: ' + error.message, 500);
  }
}