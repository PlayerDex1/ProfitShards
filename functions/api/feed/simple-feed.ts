// 🎯 FEED SIMPLES - Nova Abordagem
// Usa KV Storage para armazenar runs de forma simples e confiável

interface Env {
  KV?: KVNamespace;
}

interface SimpleRun {
  id: string;
  map: string;
  luck: number;
  tokens: number;
  timeAgo: string;
  timestamp: number;
  user?: string; // opcional
}

const FEED_KEY = 'community_feed_runs';
const MAX_RUNS = 20;

// GET - Retornar runs
export async function onRequestGet({ env }: { env: Env }) {
  try {
    console.log('📊 SIMPLE FEED: Buscando runs...');

    if (!env.KV) {
      console.log('⚠️ KV não disponível, usando dados demo');
      return returnDemoData();
    }

    // Buscar dados do KV
    const storedRuns = await env.KV.get(FEED_KEY, 'json');
    let runs: SimpleRun[] = storedRuns || [];

    // Atualizar timeAgo para todas as runs
    runs = runs.map(run => ({
      ...run,
      timeAgo: getTimeAgo(run.timestamp)
    }));

    // Ordenar por timestamp (mais recente primeiro)
    runs.sort((a, b) => b.timestamp - a.timestamp);

    // Limitar quantidade
    runs = runs.slice(0, MAX_RUNS);

    console.log(`📊 Retornando ${runs.length} runs`);

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
        'Cache-Control': 'public, max-age=60', // 1 minuto
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('❌ Erro no simple feed:', error);
    return returnDemoData();
  }
}

// POST - Adicionar nova run
export async function onRequestPost({ env, request }: { env: Env; request: Request }) {
  try {
    console.log('📝 SIMPLE FEED: Adicionando nova run...');

    if (!env.KV) {
      return new Response(JSON.stringify({
        success: false,
        error: 'KV storage not available'
      }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    // Parse dados
    let runData;
    try {
      runData = await request.json();
    } catch {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid JSON'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Validação mínima
    if (!runData.mapSize || !runData.tokensDropped || runData.tokensDropped <= 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing or invalid data',
        required: 'mapSize, tokensDropped > 0'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Buscar runs existentes
    const existingRuns: SimpleRun[] = await env.KV.get(FEED_KEY, 'json') || [];

    // Criar nova run
    const newRun: SimpleRun = {
      id: `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      map: formatMapName(runData.mapSize),
      luck: runData.luck || 0,
      tokens: runData.tokensDropped,
      timeAgo: 'agora mesmo',
      timestamp: Date.now(),
      user: runData.user || 'Jogador'
    };

    // Adicionar no início da lista
    const updatedRuns = [newRun, ...existingRuns];

    // Manter apenas as últimas X runs
    const trimmedRuns = updatedRuns.slice(0, MAX_RUNS);

    // Salvar no KV
    await env.KV.put(FEED_KEY, JSON.stringify(trimmedRuns));

    console.log(`✅ Run adicionada: ${newRun.map} - ${newRun.tokens} tokens`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Run added to feed',
      data: newRun,
      totalRuns: trimmedRuns.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erro ao adicionar run:', error);
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

// Utilitários
function formatMapName(mapSize: string): string {
  const names: Record<string, string> = {
    'small': 'Small Map',
    'medium': 'Medium Map', 
    'large': 'Large Map',
    'xlarge': 'XLarge Map'
  };
  return names[mapSize] || mapSize;
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

function returnDemoData() {
  const demoRuns: SimpleRun[] = [
    {
      id: 'demo-1',
      map: 'Medium Map',
      luck: 1250,
      tokens: 185,
      timeAgo: '3min atrás',
      timestamp: Date.now() - 3 * 60 * 1000
    },
    {
      id: 'demo-2',
      map: 'Large Map', 
      luck: 2100,
      tokens: 420,
      timeAgo: '8min atrás',
      timestamp: Date.now() - 8 * 60 * 1000
    },
    {
      id: 'demo-3',
      map: 'XLarge Map',
      luck: 3800,
      tokens: 750,
      timeAgo: '15min atrás',
      timestamp: Date.now() - 15 * 60 * 1000
    }
  ];

  return new Response(JSON.stringify({
    success: true,
    runs: demoRuns,
    cached: false,
    fallback: true,
    total: demoRuns.length,
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}