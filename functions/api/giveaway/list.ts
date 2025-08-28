import { createResponse, createErrorResponse } from '../../_lib/response';

export async function onRequestGet(context: any) {
  try {
    const { env } = context;
    
    // Buscar todos os giveaways ativos no D1
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
      WHERE status IN ('active', 'upcoming')
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