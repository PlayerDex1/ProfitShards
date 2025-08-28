import { createResponse, createErrorResponse } from '../../_lib/response';

export async function onRequestDelete(context: any) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return createErrorResponse('Missing giveaway ID', 400);
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