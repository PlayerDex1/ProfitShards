interface Env {
  DB: D1Database;
}

interface MapRunData {
  mapSize: string;
  luck: number;
  loads: number;
  tokensDropped: number;
  timestamp: number;
}

export async function onRequestPost(context: { env: Env; request: Request }) {
  try {
    const { env, request } = context;
    
    console.log('🗺️ SAVE MAP RUN: Iniciando...', {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries())
    });
    
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
      console.log('❌ Sessão não encontrada');
      return new Response(JSON.stringify({ 
        success: false,
        error: 'No session' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Buscar usuário pela sessão
    const session = await env.DB.prepare(`
      SELECT u.id, u.email 
      FROM sessions s 
      JOIN users u ON s.user_id = u.id 
      WHERE s.session_id = ? AND s.expires_at > ?
    `).bind(sessionCookie, Date.now()).first();

    if (!session) {
      console.log('❌ Sessão inválida ou expirada');
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Invalid session' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`✅ Usuário autenticado: ${session.email}`);

    // Parse do corpo da requisição
    let runData: MapRunData;
    try {
      runData = await request.json();
      console.log('📦 Dados recebidos:', runData);
    } catch (error) {
      console.log('❌ Erro parsing JSON:', error);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Invalid JSON' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validar dados
    if (!runData.mapSize || runData.tokensDropped === undefined || runData.tokensDropped === null || !runData.timestamp) {
      console.log('❌ Dados inválidos:', runData);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Missing required fields',
        received: runData
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Só salvar se tokens > 0 (evitar spam de runs vazias)
    if (runData.tokensDropped <= 0) {
      console.log('⚠️ Tokens <= 0, não salvando:', runData.tokensDropped);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Tokens must be greater than 0',
        received: runData.tokensDropped
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Calcular eficiência
    const efficiency = runData.loads > 0 ? runData.tokensDropped / runData.loads : 0;

    // Preparar dados para inserção
    const insertData = {
      id: `${session.id}_${runData.timestamp}`,
      user_id: session.id,
      map_name: runData.mapSize, // small, medium, large, xlarge
      map_size: runData.mapSize,
      drop_data: JSON.stringify({
        luck: runData.luck || 0,
        loads: runData.loads || 0,
        energyCost: getEnergyFromMapSize(runData.mapSize),
        timestamp: runData.timestamp
      }),
      tokens_earned: runData.tokensDropped,
      time_spent: 0, // Não temos esse dado do MapPlanner original
      efficiency_rating: efficiency,
      created_at: runData.timestamp
    };

    console.log('💾 Inserindo run no D1:', {
      map: insertData.map_name,
      tokens: insertData.tokens_earned,
      efficiency: insertData.efficiency_rating,
      user_id: insertData.user_id
    });

    // Inserir no D1 com tratamento de erro
    let insertResult;
    try {
      insertResult = await env.DB.prepare(`
        INSERT INTO user_map_drops (
          id, user_id, map_name, map_size, drop_data, tokens_earned, 
          time_spent, efficiency_rating, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        insertData.id,
        insertData.user_id,
        insertData.map_name,
        insertData.map_size,
        insertData.drop_data,
        insertData.tokens_earned,
        insertData.time_spent,
        insertData.efficiency_rating,
        insertData.created_at
      ).run();

      console.log('📋 Resultado do INSERT:', insertResult);
    } catch (dbError) {
      console.error('❌ Erro na inserção D1:', dbError);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Database insertion failed',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`✅ Map run saved: ${runData.mapSize} - ${runData.tokensDropped} tokens - ${efficiency.toFixed(1)} T/E`);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Map run saved successfully',
      data: {
        id: insertData.id,
        mapSize: runData.mapSize,
        tokens: runData.tokensDropped,
        efficiency: efficiency.toFixed(1)
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erro salvando map run:', error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Helper para calcular energia baseado no tamanho do mapa
function getEnergyFromMapSize(mapSize: string): number {
  const energyMap: Record<string, number> = {
    'small': 4,    // 1×4
    'medium': 8,   // 2×4  
    'large': 16,   // 4×4
    'xlarge': 24   // 6×4
  };
  return energyMap[mapSize] || 8;
}