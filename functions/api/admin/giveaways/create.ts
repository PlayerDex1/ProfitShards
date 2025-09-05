interface Env {
  DB: D1Database;
}

interface GiveawayData {
  title: string;
  description: string;
  maxParticipants?: number;
  startDate?: string;
  endDate?: string;
  requirements: any[];
  rewards: {
    type: string;
    amount: number;
    description: string;
  }[];
  status: 'draft' | 'active' | 'completed' | 'cancelled';
}

export async function onRequestPost(context: { env: Env; request: Request }) {
  try {
    const { env, request } = context;
    
    console.log('🎁 CREATE GIVEAWAY: Iniciando...');
    
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

    // Obter dados da requisição
    const giveawayData: GiveawayData = await request.json();
    
    if (!giveawayData.title || !giveawayData.description) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Title and description are required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Garantir que a tabela existe
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS giveaways (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        max_participants INTEGER,
        start_date INTEGER,
        end_date INTEGER,
        requirements TEXT,
        rewards TEXT,
        status TEXT DEFAULT 'draft',
        created_at INTEGER NOT NULL,
        created_by TEXT NOT NULL,
        participants TEXT DEFAULT '[]',
        winners TEXT DEFAULT '[]'
      )
    `).run();

    // Gerar ID único
    const giveawayId = `giveaway_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();
    
    // Processar datas
    const startDate = giveawayData.startDate ? new Date(giveawayData.startDate).getTime() : now;
    const endDate = giveawayData.endDate ? new Date(giveawayData.endDate).getTime() : now + (30 * 24 * 60 * 60 * 1000); // 30 dias padrão

    // Inserir giveaway
    await env.DB.prepare(`
      INSERT INTO giveaways (
        id, title, description, max_participants, start_date, end_date,
        requirements, rewards, status, created_at, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      giveawayId,
      giveawayData.title,
      giveawayData.description,
      giveawayData.maxParticipants || null,
      startDate,
      endDate,
      JSON.stringify(giveawayData.requirements || []),
      JSON.stringify(giveawayData.rewards || []),
      giveawayData.status || 'draft',
      now,
      userEmail
    ).run();

    console.log(`✅ Giveaway criado: ${giveawayId}`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Giveaway criado com sucesso',
      data: {
        id: giveawayId,
        title: giveawayData.title,
        status: giveawayData.status || 'draft',
        createdAt: new Date(now).toISOString()
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erro ao criar giveaway:', error);
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