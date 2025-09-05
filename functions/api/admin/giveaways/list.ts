interface Env {
  DB: D1Database;
}

export async function onRequestGet(context: { env: Env; request: Request }) {
  try {
    const { env, request } = context;
    
    console.log('🎁 LIST GIVEAWAYS: Iniciando...');
    
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

    // Buscar giveaways
    const giveawaysQuery = await env.DB.prepare(`
      SELECT * FROM giveaways
      ORDER BY created_at DESC
    `).all();

    const giveaways = (giveawaysQuery?.results || []).map((giveaway: any) => ({
      id: giveaway.id,
      title: giveaway.title,
      description: giveaway.description,
      maxParticipants: giveaway.max_participants,
      startDate: new Date(giveaway.start_date).toISOString(),
      endDate: new Date(giveaway.end_date).toISOString(),
      requirements: JSON.parse(giveaway.requirements || '[]'),
      rewards: JSON.parse(giveaway.rewards || '[]'),
      status: giveaway.status,
      createdAt: new Date(giveaway.created_at).toISOString(),
      createdBy: giveaway.created_by,
      participants: JSON.parse(giveaway.participants || '[]'),
      winners: JSON.parse(giveaway.winners || '[]'),
      participantCount: JSON.parse(giveaway.participants || '[]').length,
      completionRate: giveaway.max_participants 
        ? (JSON.parse(giveaway.participants || '[]').length / giveaway.max_participants)
        : 0
    }));

    console.log(`✅ ${giveaways.length} giveaways encontrados`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Giveaways listados com sucesso',
      data: {
        giveaways,
        total: giveaways.length,
        active: giveaways.filter(g => g.status === 'active').length,
        completed: giveaways.filter(g => g.status === 'completed').length,
        draft: giveaways.filter(g => g.status === 'draft').length
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erro ao listar giveaways:', error);
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