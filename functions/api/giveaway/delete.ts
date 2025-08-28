import { createResponse, createErrorResponse } from '../../_lib/response';
import { verifyAuth } from '../../_lib/auth';

export async function onRequestDelete(context: any) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return createErrorResponse('Missing giveaway ID', 400);
    }
    
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

    // Deletar giveaway
    const result = await env.DB.prepare(`
      DELETE FROM giveaways WHERE id = ?
    `).bind(id).run();

    if (result.changes === 0) {
      return createErrorResponse('Giveaway not found', 404);
    }

    return createResponse({ 
      success: true, 
      message: 'Giveaway deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting giveaway:', error);
    return createErrorResponse('Failed to delete giveaway', 500);
  }
}