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
    
    // Buscar todos os giveaways para admin
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
      ORDER BY created_at DESC
    `).all();

    const giveaways = result.results.map((row: any) => ({
      ...row,
      rules: row.rules ? JSON.parse(row.rules) : [],
      requirements: row.requirements ? JSON.parse(row.requirements) : [],
    }));

    return createResponse({ giveaways });
  } catch (error) {
    console.error('Error fetching giveaways:', error);
    return createErrorResponse('Failed to fetch giveaways', 500);
  }
}