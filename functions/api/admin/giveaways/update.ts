interface Env {
  DB: D1Database;
}

interface GiveawayUpdateData {
  title?: string;
  description?: string;
  maxParticipants?: number;
  startDate?: string;
  endDate?: string;
  requirements?: any[];
  rewards?: any[];
  status?: 'draft' | 'active' | 'completed' | 'cancelled';
}

export async function onRequestPut(context: { env: Env; request: Request }) {
  try {
    const { env, request } = context;
    
    console.log('🎁 UPDATE GIVEAWAY: Iniciando...');
    
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

    // Obter dados da requisição
    const updateData: GiveawayUpdateData = await request.json();
    
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

    // Construir query de atualização dinamicamente
    const updateFields = [];
    const updateValues = [];

    if (updateData.title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(updateData.title);
    }
    
    if (updateData.description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(updateData.description);
    }
    
    if (updateData.maxParticipants !== undefined) {
      updateFields.push('max_participants = ?');
      updateValues.push(updateData.maxParticipants);
    }
    
    if (updateData.startDate !== undefined) {
      updateFields.push('start_date = ?');
      updateValues.push(new Date(updateData.startDate).getTime());
    }
    
    if (updateData.endDate !== undefined) {
      updateFields.push('end_date = ?');
      updateValues.push(new Date(updateData.endDate).getTime());
    }
    
    if (updateData.requirements !== undefined) {
      updateFields.push('requirements = ?');
      updateValues.push(JSON.stringify(updateData.requirements));
    }
    
    if (updateData.rewards !== undefined) {
      updateFields.push('rewards = ?');
      updateValues.push(JSON.stringify(updateData.rewards));
    }
    
    if (updateData.status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(updateData.status);
    }

    if (updateFields.length === 0) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'No fields to update' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Adicionar ID no final dos valores
    updateValues.push(giveawayId);

    // Executar atualização
    await env.DB.prepare(`
      UPDATE giveaways 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `).bind(...updateValues).run();

    console.log(`✅ Giveaway atualizado: ${giveawayId}`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Giveaway atualizado com sucesso',
      data: {
        id: giveawayId,
        updatedFields: updateFields.length,
        timestamp: new Date().toISOString()
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar giveaway:', error);
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