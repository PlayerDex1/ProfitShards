// 🔥 API OTIMIZADA PARA FEED DE ATIVIDADES
// Feed orgânico baseado em atividade real dos usuários

interface Env {
  DB: D1Database;
  KV?: KVNamespace;
}

interface ActivityRun {
  id: string;
  map: string;           // Small/Medium/Large/XLarge
  luck: number;          // Luck usado
  tokens: number;        // Tokens dropados
  timeAgo: string;       // "há 5 min"
  timestamp: number;     // Para ordenação
}

const CACHE_KEY = 'activity_feed_cache';
const CACHE_TTL = 30; // 30 segundos

export async function onRequestGet({ env, request }: { env: Env; request: Request }) {
  try {
    console.log('🔥 ACTIVITY FEED: Buscando stream de atividades...');

    // Verificar se é force refresh
    const url = new URL(request.url);
    const forceRefresh = url.searchParams.has('force');
    
    if (forceRefresh) {
      console.log('⚡ Force refresh solicitado - ignorando cache');
    }

    // 1. TENTAR CACHE PRIMEIRO (performance) - exceto se force refresh
    if (env.KV && !forceRefresh) {
      try {
        const cached = await env.KV.get(CACHE_KEY, 'json');
        if (cached) {
          console.log('📦 Cache hit - retornando dados em cache');
          return new Response(JSON.stringify({
            success: true,
            runs: cached,
            cached: true,
            timestamp: new Date().toISOString()
          }), {
            status: 200,
            headers: { 
              'Content-Type': 'application/json',
              'Cache-Control': 'public, max-age=30' // 30 seg browser cache
            }
          });
        }
      } catch (cacheError) {
        console.log('⚠️ Cache error (continuando):', cacheError);
      }
    }

    // 2. BUSCAR DADOS REAIS DO BANCO
    let activityRuns: ActivityRun[] = [];

    // Parâmetros de paginação
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const offset = (page - 1) * limit;

    if (env.DB) {
      try {
        // Buscar runs das últimas 30 dias (expandido para muito mais dados)
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        
        const dbResult = await env.DB.prepare(`
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
          LIMIT ? OFFSET ?
        `).bind(thirtyDaysAgo, limit, offset).all();

        console.log(`📊 Encontradas ${dbResult.results?.length || 0} runs recentes`);
        console.log('🔍 SAMPLE: Primeiras runs do banco:', dbResult.results?.slice(0, 3).map(r => ({
          id: r.id,
          map_name: r.map_name,
          tokens_earned: r.tokens_earned,
          created_at: r.created_at,
          created_at_date: new Date(r.created_at).toISOString()
        })));

        // Processar dados do banco
        if (dbResult.results && dbResult.results.length > 0) {
          activityRuns = dbResult.results.map((run: any) => {
            // Calcular tempo atrás
            const timeDiff = Date.now() - (run.created_at || Date.now());
            const minutes = Math.floor(timeDiff / (1000 * 60));
            const hours = Math.floor(minutes / 60);
            
            let timeAgo;
            if (hours > 0) {
              timeAgo = `${hours}h atrás`;
            } else if (minutes > 0) {
              timeAgo = `${minutes}min atrás`;
            } else {
              timeAgo = 'agora mesmo';
            }

            return {
              id: run.id,
              map: run.map_name, // Já vem formatado da tabela feed_runs
              luck: run.luck || 0,
              tokens: run.tokens || 0,
              timeAgo,
              timestamp: run.created_at || Date.now(),
              playerName: run.player_name || 'Player',
              level: run.level || 'IV',
              tier: run.tier || 'I',
              charge: run.charge || 4,
              efficiency: run.efficiency || 0
            };
          });
          
          console.log('🔄 Runs processadas antes do filtro:', activityRuns.length);
          console.log('🔍 SAMPLE processadas:', activityRuns.slice(0, 3));
          
          activityRuns = activityRuns.filter(run => run.tokens > 0); // Apenas runs válidas
          console.log('✅ Runs válidas após filtro:', activityRuns.length);
        }

      } catch (dbError) {
        console.error('❌ Erro ao buscar dados do banco:', dbError);
      }
    }

    // 3. NÃO GERAR DADOS FAKE - APENAS DADOS REAIS
    console.log(`📊 Total de runs reais encontradas: ${activityRuns.length}`);

    // 4. SALVAR NO CACHE PARA PRÓXIMAS REQUESTS
    if (env.KV && activityRuns.length > 0) {
      try {
        await env.KV.put(CACHE_KEY, JSON.stringify(activityRuns), {
          expirationTtl: CACHE_TTL
        });
        console.log('💾 Dados salvos no cache');
      } catch (cacheError) {
        console.log('⚠️ Erro salvando cache (não crítico):', cacheError);
      }
    }

    // 5. RETORNAR RESULTADO
    console.log(`📊 Retornando ${activityRuns.length} runs para o frontend`);
    return new Response(JSON.stringify({
      success: true,
      runs: activityRuns,
      cached: false,
      total: activityRuns.length,
      page: page,
      limit: limit,
      hasMore: activityRuns.length === limit, // Se retornou o limite, provavelmente há mais
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=30',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('❌ ERRO GERAL no activity feed:', error);
    
    // FALLBACK DE EMERGÊNCIA - apenas em caso de erro crítico
    const emergencyRuns: ActivityRun[] = [];
    
    return new Response(JSON.stringify({
      success: true,
      runs: emergencyRuns,
      error: 'Usando dados demo devido a erro temporário',
      fallback: true,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
