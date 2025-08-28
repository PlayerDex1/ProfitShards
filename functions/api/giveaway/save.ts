import { createResponse, createErrorResponse } from '../../_lib/response';
import { verifyAuth } from '../../_lib/auth';

export async function onRequestPost(context: any) {
  try {
    const { request, env } = context;
    
    // Verificar autenticação de admin
    const authResult = await verifyAuth(request, env);
    if (!authResult.success) {
      return createErrorResponse('Unauthorized', 401);
    }

    // Verificar se é admin (você pode ajustar essa lista)
    const adminEmails = ['profitshards@gmail.com', 'admin@profitshards.com', 'holdboy01@gmail.com'];
    if (!adminEmails.includes(authResult.user.email)) {
      return createErrorResponse('Forbidden - Admin only', 403);
    }

    const data = await request.json();
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
    const isUpdate = !!id;

    if (isUpdate) {
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
      
      await env.DB.prepare(`
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