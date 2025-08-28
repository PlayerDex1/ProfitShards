import { createResponse, createErrorResponse } from '../../_lib/response';

export async function onRequestPost(context: any) {
  try {
    const { request, env } = context;

    // Criar tabela se não existir (auto-setup)
    try {
      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS giveaways (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          prize TEXT NOT NULL,
          start_date TEXT NOT NULL,
          end_date TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'active',
          max_participants INTEGER,
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
      console.log('Tabela já existe ou erro menor:', setupError);
    }

    const data = await request.json();
    console.log('🔄 DADOS RECEBIDOS PARA SALVAR:', JSON.stringify(data, null, 2));
    
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

    console.log('📋 CAMPOS EXTRAÍDOS:', {
      id, title, description, prize, startDate, endDate, status,
      maxParticipants, currentParticipants, rulesCount: rules.length,
      requirementsCount: requirements.length
    });

    // Validações básicas
    if (!title || !description || !prize || !startDate || !endDate) {
      console.error('❌ CAMPOS OBRIGATÓRIOS FALTANDO:', { title: !!title, description: !!description, prize: !!prize, startDate: !!startDate, endDate: !!endDate });
      return createErrorResponse('Missing required fields', 400);
    }

    const now = new Date().toISOString();
    const isUpdate = !!id;

    console.log('🔍 DETECTANDO OPERAÇÃO:', {
      id: id,
      isUpdate: isUpdate,
      operation: isUpdate ? 'UPDATE' : 'INSERT'
    });

    if (isUpdate) {
      // Verificar se o giveaway realmente existe
      const existingCheck = await env.DB.prepare(`
        SELECT id FROM giveaways WHERE id = ?
      `).bind(id).first();
      
      console.log('🔍 GIVEAWAY EXISTE?', {
        id: id,
        exists: !!existingCheck
      });
      
      if (!existingCheck) {
        console.log('⚠️ GIVEAWAY NÃO EXISTE, FORÇANDO INSERT...');
        // Forçar INSERT se não existir
        const newId = id || `giveaway_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        console.log('➕ FORÇANDO CRIAÇÃO COM ID:', newId);
        
        try {
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
            status,
            maxParticipants,
            currentParticipants,
            JSON.stringify(rules),
            JSON.stringify(requirements),
            winnerAnnouncement,
            imageUrl,
            now,
            now
          ).run();
          
          console.log('✅ INSERT FORÇADO RESULTADO:', {
            success: result.success,
            changes: result.changes,
            lastRowId: result.meta?.last_row_id
          });
          
          return createResponse({ 
            success: true, 
            message: 'Giveaway created successfully (forced)',
            id: newId 
          });
        } catch (insertError) {
          console.error('💥 ERRO NO INSERT FORÇADO:', insertError);
          throw insertError;
        }
      }

    if (isUpdate && existingCheck) {
      // Atualizar giveaway existente
      await env.DB.prepare(`
        UPDATE giveaways SET
          title = ?,
          description = ?,
          prize = ?,
          start_date = ?,
          end_date = ?,
          status = ?,
          max_participants = ?,
          current_participants = ?,
          rules = ?,
          requirements = ?,
          winner_announcement = ?,
          image_url = ?,
          updated_at = ?
        WHERE id = ?
      `).bind(
        title,
        description,
        prize,
        startDate,
        endDate,
        status,
        maxParticipants,
        currentParticipants,
        JSON.stringify(rules),
        JSON.stringify(requirements),
        winnerAnnouncement,
        imageUrl,
        now,
        id
      ).run();

      // Se este giveaway foi definido como ativo, desativar outros
      if (status === 'active') {
        await env.DB.prepare(`
          UPDATE giveaways SET status = 'ended', updated_at = ?
          WHERE id != ? AND status = 'active'
        `).bind(now, id).run();
      }

      return createResponse({ 
        success: true, 
        message: 'Giveaway updated successfully',
        id 
      });
    } else {
      // Criar novo giveaway
      const newId = `giveaway_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('➕ CRIANDO NOVO GIVEAWAY:', {
        newId, title, description, prize, startDate, endDate, status,
        maxParticipants, currentParticipants
      });
      
      try {
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
          status,
          maxParticipants,
          currentParticipants,
          JSON.stringify(rules),
          JSON.stringify(requirements),
          winnerAnnouncement,
          imageUrl,
          now,
          now
        ).run();
        
        console.log('✅ INSERT RESULTADO:', {
          success: result.success,
          changes: result.changes,
          lastRowId: result.meta?.last_row_id,
          error: result.error
        });
      } catch (insertError) {
        console.error('💥 ERRO NO INSERT:', insertError);
        throw insertError;
      }

      // Se este giveaway foi definido como ativo, desativar outros
      if (status === 'active') {
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
    }
  } catch (error) {
    console.error('Error saving giveaway:', error);
    return createErrorResponse('Failed to save giveaway', 500);
  }
}