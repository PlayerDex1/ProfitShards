// 🎯 FEED RUNS - API Simples com D1
// Usa tabela dedicada feed_runs para o feed de atividade

interface Env {
  DB: D1Database;
}

interface FeedRun {
  id: string;
  map: string;
  luck: number;
  tokens: number;
  timeAgo: string;
  timestamp: number;
  efficiency?: number;
  // 🆕 Novos campos
  level?: string;
  tier?: string;
  charge?: number;
  playerName?: string;
}

interface NewRunData {
  mapSize: string;
  luck?: number;
  tokensDropped: number;
  loads?: number;
  timestamp?: number;
  userEmail?: string;
  // 🆕 Novos campos
  level?: string;
  tier?: string;
  charge?: number;
  // 🆕 Nome do usuário do equipamento
  playerName?: string;
}

// GET - Buscar runs para o feed
export async function onRequestGet({ env }: { env: Env }) {
  try {
    console.log('📊 FEED RUNS: Buscando runs do feed...');

    if (!env.DB) {
      console.log('❌ D1 Database não disponível');
      return returnErrorResponse('Database not available', 500);
    }

    // Buscar últimas 15 runs das últimas 24 horas
    const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    const result = await env.DB.prepare(`
      SELECT 
        id,
        map_name,
        luck,
        tokens,
        efficiency,
        created_at,
        level,
        tier,
        charge,
        player_name
      FROM feed_runs 
      WHERE created_at > ? 
      ORDER BY created_at DESC 
      LIMIT 15
    `).bind(twentyFourHoursAgo).all();

    console.log(`📊 Encontradas ${result.results?.length || 0} runs`);

    // Processar dados
    const runs: FeedRun[] = (result.results || []).map((row: any) => ({
      id: row.id,
      map: row.map_name,
      luck: row.luck || 0,
      tokens: row.tokens,
      efficiency: row.efficiency || 0,
      timeAgo: getTimeAgo(row.created_at),
      timestamp: row.created_at,
      // 🆕 Novos campos
      level: row.level || 'I',
      tier: row.tier || 'I',
      charge: row.charge || 0,
      playerName: row.player_name || 'Player'
    }));

    return new Response(JSON.stringify({
      success: true,
      runs: runs,
      cached: false,
      total: runs.length,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar feed runs:', error);
    return returnErrorResponse(
      'Failed to fetch runs', 
      500, 
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

// POST - Adicionar nova run ao feed
export async function onRequestPost({ env, request }: { env: Env; request: Request }) {
  try {
    console.log('📝 FEED RUNS: Adicionando nova run...');

    if (!env.DB) {
      return returnErrorResponse('Database not available', 500);
    }

    // Parse dados
    let runData: NewRunData;
    try {
      runData = await request.json();
      console.log('📦 Dados recebidos:', runData);
    } catch {
      return returnErrorResponse('Invalid JSON data', 400);
    }

    // Validação básica
    if (!runData.mapSize || !runData.tokensDropped || runData.tokensDropped <= 0) {
      return returnErrorResponse('Missing required fields: mapSize, tokensDropped > 0', 400);
    }

    // Preparar dados para inserção
    const now = Date.now();
    const efficiency = calculateEfficiency(runData.tokensDropped, runData.luck || 0);
    
    // 🎯 FASE 2: Criar nome inteligente do usuário
    const playerName = createPlayerNameFromEmail(runData.userEmail || 'anonymous@feed.com');
    
    const newRun = {
      id: `feed_${now}_${Math.random().toString(36).substr(2, 6)}`,
      user_email: runData.userEmail || 'anonymous@feed.com',
      map_name: formatMapName(runData.mapSize),
      luck: runData.luck || 0,
      tokens: runData.tokensDropped,
      efficiency: efficiency,
      created_at: runData.timestamp || now,
      // 🆕 Novos campos
      level: runData.level || 'I',
      tier: runData.tier || 'I',
      charge: runData.charge || 0,
      player_name: playerName
    };

    console.log('💾 Inserindo run:', newRun);

    // Inserir no D1
    const insertResult = await env.DB.prepare(`
      INSERT INTO feed_runs (id, user_email, map_name, luck, tokens, efficiency, created_at, level, tier, charge, player_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      newRun.id,
      newRun.user_email,
      newRun.map_name,
      newRun.luck,
      newRun.tokens,
      newRun.efficiency,
      newRun.created_at,
      newRun.level,
      newRun.tier,
      newRun.charge,
      newRun.player_name
    ).run();

    console.log('📋 Resultado INSERT:', insertResult);

    // Limpeza automática - manter apenas últimas 50 runs
    await env.DB.prepare(`
      DELETE FROM feed_runs 
      WHERE id NOT IN (
        SELECT id FROM feed_runs 
        ORDER BY created_at DESC 
        LIMIT 50
      )
    `).run();

    console.log(`✅ Run adicionada ao feed: ${newRun.map_name} - ${newRun.tokens} tokens`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Run added to feed successfully',
      data: {
        id: newRun.id,
        map: newRun.map_name,
        tokens: newRun.tokens,
        efficiency: newRun.efficiency.toFixed(3)
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erro ao adicionar run ao feed:', error);
    return returnErrorResponse(
      'Failed to add run to feed',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

// Utilitários
function formatMapName(mapSize: string): string {
  const mapNames: Record<string, string> = {
    'small': 'Small Map',
    'medium': 'Medium Map',
    'large': 'Large Map', 
    'xlarge': 'XLarge Map'
  };
  return mapNames[mapSize.toLowerCase()] || mapSize;
}

function calculateEfficiency(tokens: number, luck: number): number {
  if (luck <= 0) return 0;
  return tokens / luck;
}

function getTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d atrás`;
  if (hours > 0) return `${hours}h atrás`;
  if (minutes > 0) return `${minutes}min atrás`;
  return 'agora mesmo';
}

// 🎯 FASE 2: Função para criar nome do player a partir do email
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


function returnErrorResponse(message: string, status: number, details?: string) {
  return new Response(JSON.stringify({
    success: false,
    error: message,
    ...(details && { details })
  }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}