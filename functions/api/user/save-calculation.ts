export interface Env {
  DB: D1Database;
}

interface CalculationData {
  type: 'profit' | 'equipment' | 'mapdrops';
  data: any;
  results?: any;
}

export async function onRequestPost({ env, request }: { env: Env; request: Request }) {
  try {
    const body = await request.json();
    const requestId = Math.random().toString(36).substr(2, 9);
    
    // Verificar se é uma tentativa de retry
    if (body.retryAttempt && body.retryAttempt > 0) {
      console.log(`⚠️ [${requestId}] Tentativa de retry detectada (${body.retryAttempt}), ignorando para evitar duplicação`);
      return Response.json({ 
        success: true, 
        message: 'Retry ignorado para evitar duplicação',
        retryIgnored: true 
      });
    }
    
    console.log(`📥 [${requestId}] Recebido cálculo para salvar:`, { 
      type: body.type, 
      timestamp: Date.now(),
      hasData: !!body.data,
      hasResults: !!body.results,
      retryAttempt: body.retryAttempt || 0,
      dataPreview: body.data ? {
        mapSize: body.data.mapSize,
        tokensDropped: body.data.tokensDropped,
        timestamp: body.data.timestamp
      } : null
    });
    
    // Get user from session
    const cookie = request.headers.get('Cookie');
    if (!cookie) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const sessionMatch = cookie.match(/ps_session=([^;]+)/);
    if (!sessionMatch) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const sessionId = sessionMatch[1];

    // Verify session
    const session = await env.DB.prepare(
      'SELECT user_id FROM sessions WHERE session_id = ? AND expires_at > ?'
    ).bind(sessionId, Date.now()).first();

    if (!session) {
      return Response.json({ error: 'Session expired' }, { status: 401 });
    }

    if (!body.type || !body.data) {
      return Response.json({ error: 'Invalid calculation data' }, { status: 400 });
    }

    // Save calculation
    const calculationId = crypto.randomUUID();
    const now = Date.now();

    await env.DB.prepare(`
      INSERT INTO user_calculations (id, user_id, calculation_type, calculation_data, result_data, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      calculationId,
      session.user_id,
      body.type,
      JSON.stringify(body.data),
      body.results ? JSON.stringify(body.results) : null,
      now,
      now
    ).run();

    // Log activity
    await env.DB.prepare(`
      INSERT INTO user_activity (id, user_id, activity_type, activity_data, created_at)
      VALUES (?, ?, 'calculation_saved', ?, ?)
    `).bind(
      crypto.randomUUID(),
      session.user_id,
      JSON.stringify({ type: body.type, calculationId }),
      now
    ).run();

    // 🔥 ADICIONAR AO FEED DA COMUNIDADE
    if ((body.type === 'profit' && body.data && body.results) || (body.type === 'mapdrops' && body.data)) {
      try {
        // Extrair dados da run para o feed
        const runData = body.data;
        const runResults = body.results;
        
        // Calcular eficiência e tokens baseado no tipo
        let tokens, luck, efficiency;
        
        if (body.type === 'profit') {
          tokens = runResults.tokensFarmed || 0;
          luck = runData.luck || 0;
          efficiency = luck > 0 ? tokens / luck : 0;
        } else if (body.type === 'mapdrops') {
          tokens = runData.tokensDropped || 0;
          luck = runData.totalLuck || runData.charges * 4 || 0; // Fallback para charges * 4
          efficiency = luck > 0 ? tokens / luck : 0;
        }
        
        // Obter nome do usuário
        const userResult = await env.DB.prepare(
          'SELECT email FROM users WHERE id = ?'
        ).bind(session.user_id).first();
        
        const userEmail = userResult?.email || 'anonymous@feed.com';
        const playerName = createPlayerNameFromEmail(userEmail);
        
        // Verificar se já existe uma run recente para este usuário (evitar duplicação)
        // Verificação mais robusta: mesmo usuário, mesmo mapa, dentro de 30 segundos
        const recentRuns = await env.DB.prepare(`
          SELECT COUNT(*) as count FROM feed_runs 
          WHERE user_email = ? AND created_at > ? AND map_name = ?
        `).bind(
          userEmail,
          now - 30000, // Últimos 30 segundos (mais restritivo)
          formatMapName(runData.mapSize || 'medium')
        ).first();
        
        if (recentRuns && recentRuns.count > 0) {
          console.log(`⚠️ [${requestId}] Run duplicada detectada para ${userEmail} (${recentRuns.count} runs recentes), ignorando...`);
          return Response.json({ 
            success: true, 
            message: 'Run duplicada ignorada',
            duplicate: true 
          });
        }
        
        // Inserir na tabela feed_runs com ID mais único
        const feedRunId = `feed_${now}_${Math.random().toString(36).substr(2, 9)}_${session.user_id}`;
        
        // Verificar se este ID específico já existe (proteção adicional)
        const existingRun = await env.DB.prepare(`
          SELECT id FROM feed_runs WHERE id = ?
        `).bind(feedRunId).first();
        
        if (existingRun) {
          console.log(`⚠️ [${requestId}] ID de run já existe, gerando novo ID...`);
          const newFeedRunId = `feed_${now}_${Math.random().toString(36).substr(2, 9)}_${session.user_id}`;
          console.log(`🔄 Novo ID gerado: ${newFeedRunId}`);
        }
        
        console.log('🔍 DEBUG: Tentando inserir run no feed:', {
          feedRunId,
          userEmail,
          playerName,
          userId: session.user_id,
          type: body.type,
          timestamp: now
        });
        
        await env.DB.prepare(`
          INSERT INTO feed_runs (
            id, user_email, map_name, luck, tokens, efficiency, 
            created_at, level, tier, charge, player_name
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          feedRunId,
          userEmail,
          formatMapName(runData.mapSize || 'medium'),
          luck,
          tokens,
          efficiency,
          now,
          runData.level || 'I',
          runData.tier || 'I',
          runData.charge || runData.charges || 4,
          playerName
        ).run();
        
        console.log(`🔥 [${requestId}] Run adicionada ao feed da comunidade:`, {
          type: body.type,
          playerName,
          map: formatMapName(runData.mapSize || 'medium'),
          tokens,
          luck,
          feedRunId,
          userEmail,
          timestamp: now,
          dataPreview: {
            mapSize: runData.mapSize,
            tokensDropped: runData.tokensDropped,
            originalTimestamp: runData.timestamp
          }
        });
        
      } catch (feedError) {
        console.error('❌ Erro ao adicionar run ao feed:', feedError);
        // Não falhar o save principal por causa do feed
      }
    }

    console.log('Calculation saved for user:', session.user_id);

    return Response.json({ 
      success: true, 
      calculationId,
      message: 'Calculation saved successfully' 
    });

  } catch (error) {
    console.error('Save calculation error:', error);
    return Response.json({ 
      error: 'Failed to save calculation',
      details: error.message 
    }, { status: 500 });
  }
}

// Funções auxiliares para o feed
function formatMapName(mapSize: string): string {
  const mapNames: Record<string, string> = {
    'small': 'Small Map',
    'medium': 'Medium Map',
    'large': 'Large Map', 
    'xlarge': 'XLarge Map'
  };
  return mapNames[mapSize.toLowerCase()] || mapSize;
}

function createPlayerNameFromEmail(email: string): string {
  console.log('🎯 Criando nome do player para email:', email);
  
  // Se é anônimo, usar "Player"
  if (email === 'anonymous@feed.com') {
    return 'Player';
  }
  
  try {
    // Extrair parte antes do @
    const localPart = email.split('@')[0];
    
    // Se tem ponto, pegar primeira parte (ex: "joao.silva" -> "joao")
    const firstName = localPart.split('.')[0];
    
    // Capitalizar primeira letra
    const playerName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
    
    console.log(`🎯 Email: ${email} -> Nome: ${playerName}`);
    return playerName;
    
  } catch (error) {
    console.log('⚠️ Erro ao processar email, usando Player:', error);
    return 'Player';
  }
}