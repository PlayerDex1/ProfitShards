interface Env {
  DB: D1Database;
}

export async function onRequestDelete(context: { env: Env; request: Request }) {
  try {
    const { env, request } = context;
    
    console.log('🎁 DELETE GIVEAWAY: Iniciando...');
    
    if (!env.DB) {
      console.log('❌ D1 Database não disponível');
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Database not available' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar autenticação
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) {
      console.log('❌ Cookie não encontrado');
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Unauthorized' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const sessionCookie = cookieHeader
      .split(';')
      .find(c => c.trim().startsWith('ps_session='))
      ?.split('=')[1];

    if (!sessionCookie) {
      console.log('❌ Session cookie não encontrado');
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Session not found' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar se é admin
    const userEmail = sessionCookie.split('|')[0];
    const adminUsers = ['holdboy01@gmail.com', 'profitshards@gmail.com', 'admin@profitshards.com'];
    
    if (!adminUsers.includes(userEmail)) {
      console.log('❌ Usuário não é admin:', userEmail);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Admin access required' 
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Obter ID do giveaway da URL
    const url = new URL(request.url);
    const giveawayId = url.pathname.split('/').pop();
    
    if (!giveawayId) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Giveaway ID is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar se o giveaway existe
    const existingGiveaway = await env.DB.prepare(`
      SELECT * FROM giveaways WHERE id = ?
    `).bind(giveawayId).first();

    if (!existingGiveaway) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Giveaway not found' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar se o giveaway tem participantes
    const participants = JSON.parse(existingGiveaway.participants || '[]');
    if (participants.length > 0) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Cannot delete giveaway with participants. Cancel it instead.' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Deletar giveaway
    await env.DB.prepare(`
      DELETE FROM giveaways WHERE id = ?
    `).bind(giveawayId).run();

    console.log(`✅ Giveaway deletado: ${giveawayId}`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Giveaway deletado com sucesso',
      data: {
        id: giveawayId,
        title: existingGiveaway.title,
        timestamp: new Date().toISOString()
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erro ao deletar giveaway:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}