import { createResponse, createErrorResponse } from '../../_lib/response';

export async function onRequestGet(context: any) {
  try {
    const { env } = context;
    
    // Buscar giveaway ativo (apenas um por vez)
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

    if (!result) {
      return createResponse({ giveaway: null });
    }

    const giveaway = {
      ...result,
      rules: result.rules ? JSON.parse(result.rules) : [],
      requirements: result.requirements ? JSON.parse(result.requirements) : [],
    };

    return createResponse({ giveaway });
  } catch (error) {
    console.error('Error fetching active giveaway:', error);
    return createErrorResponse('Failed to fetch active giveaway', 500);
  }
}