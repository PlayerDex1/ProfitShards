import { createResponse, createErrorResponse } from '../../_lib/response';

export async function onRequestGet(context: any) {
  try {
    const { env } = context;
    
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
    
    console.log('🔍 BUSCANDO GIVEAWAY ATIVO...');
    
    // Buscar qualquer giveaway com status 'active' (sem verificar datas por agora)
    const result = await env.DB.prepare(`
      SELECT 
        id,
        title,
        description,
        prize,
        start_date as startDate,
        end_date as endDate,
        status,
        max_participants as maxParticipants,
        current_participants as currentParticipants,
        rules,
        requirements,
        winner_announcement as winnerAnnouncement,
        image_url as imageUrl,
        created_at as createdAt,
        updated_at as updatedAt
      FROM giveaways 
      WHERE status = 'active'
      ORDER BY created_at DESC
      LIMIT 1
    `).first();

    console.log('📊 RESULTADO BUSCA:', {
      found: !!result,
      id: result?.id,
      status: result?.status,
      title: result?.title
    });

    if (!result) {
      return createResponse({ giveaway: null });
    }

    const giveaway = {
      ...result,
      rules: result.rules ? JSON.parse(result.rules) : [],
      requirements: result.requirements ? JSON.parse(result.requirements) : [],
    };

    console.log('✅ GIVEAWAY ENCONTRADO:', giveaway.id);

    return createResponse({ giveaway });
  } catch (error) {
    console.error('❌ ERRO NA API ACTIVE:', error);
    return createErrorResponse('Failed to fetch active giveaway', 500);
  }
}