import { createResponse, createErrorResponse } from '../../_lib/response';
import { verifyAuth } from '../../_lib/auth';

export async function onRequestGet(context: any) {
  try {
    const { request, env } = context;
    
    // Verificar autenticação de admin
    const authResult = await verifyAuth(request, env);
    if (!authResult.success) {
      return createErrorResponse('Unauthorized', 401);
    }

    // Verificar se é admin
    const adminEmails = ['profitshards@gmail.com', 'admin@profitshards.com', 'holdboy01@gmail.com'];
    if (!adminEmails.includes(authResult.user.email)) {
      return createErrorResponse('Forbidden - Admin only', 403);
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