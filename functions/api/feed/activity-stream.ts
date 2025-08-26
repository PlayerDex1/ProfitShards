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
const CACHE_TTL = 5 * 60; // 5 minutos

export async function onRequestGet({ env, request }: { env: Env; request: Request }) {
  try {
    console.log('🔥 ACTIVITY FEED: Buscando stream de atividades...');

    // 1. TENTAR CACHE PRIMEIRO (performance)
    if (env.KV) {
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
              'Cache-Control': 'public, max-age=300' // 5 min browser cache
            }
          });
        }
      } catch (cacheError) {
        console.log('⚠️ Cache error (continuando):', cacheError);
      }
    }

    // 2. BUSCAR DADOS REAIS DO BANCO
    let activityRuns: ActivityRun[] = [];

    if (env.DB) {
      try {
        // Buscar últimas 20 runs das últimas 24 horas (mesma janela que recent-runs)
        const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
        
        const dbResult = await env.DB.prepare(`
          SELECT 
            id,
            map_name,
            tokens_earned,
            drop_data,
            created_at
          FROM user_map_drops 
          WHERE created_at > ? 
          ORDER BY created_at DESC 
          LIMIT 20
        `).bind(twentyFourHoursAgo).all();

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
            let dropData = {};
            try {
              dropData = JSON.parse(run.drop_data || '{}');
            } catch (e) {
              dropData = {};
            }

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

            // Mapear nomes dos mapas
            const mapDisplayNames: Record<string, string> = {
              'small': 'Small Map',
              'medium': 'Medium Map',
              'large': 'Large Map',
              'xlarge': 'XLarge Map'
            };

            const mapName = mapDisplayNames[run.map_name] || 
                           run.map_name || 
                           'Unknown Map';

            return {
              id: run.id,
              map: mapName,
              luck: (dropData as any).luck || 0,
              tokens: run.tokens_earned || 0,
              timeAgo,
              timestamp: run.created_at || Date.now()
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

    // 3. FALLBACK: DADOS MÍNIMOS SE NÃO HOUVER ATIVIDADE REAL
    if (activityRuns.length === 0) {
      console.log('📝 Nenhuma atividade real encontrada - aguardando dados do MapPlanner');
      // Não gerar dados fake - deixar vazio para incentivar uso real
    }

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
    return new Response(JSON.stringify({
      success: true,
      runs: activityRuns.slice(0, 15), // Máximo 15 itens
      cached: false,
      total: activityRuns.length,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
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

// Gerar dados realistas baseados nas mecânicas do jogo
function generateRealisticRuns(): ActivityRun[] {
  const maps = ['Small Map', 'Medium Map', 'Large Map', 'XLarge Map'];
  const players = ['DragonSlayer', 'LuckMaster', 'TokenHunter', 'GemCrafter', 'MapExplorer', 'FarmKing'];
  const now = Date.now();
  
  // Gerar runs com variação mais realista
  const runs: ActivityRun[] = [];
  
  // Últimas 2 horas com runs mais frequentes
  for (let i = 0; i < 12; i++) {
    const minutesAgo = Math.floor(Math.random() * 120) + 5; // 5-125 min atrás
    const mapType = maps[Math.floor(Math.random() * maps.length)];
    const player = players[Math.floor(Math.random() * players.length)];
    
    // Luck baseado no tipo do mapa
    let baseLuck, baseTokens;
    switch (mapType) {
      case 'Small Map':
        baseLuck = 600 + Math.floor(Math.random() * 400); // 600-1000
        baseTokens = Math.floor(baseLuck * (0.12 + Math.random() * 0.08)); // 12-20% efficiency
        break;
      case 'Medium Map':
        baseLuck = 1200 + Math.floor(Math.random() * 600); // 1200-1800
        baseTokens = Math.floor(baseLuck * (0.13 + Math.random() * 0.09)); // 13-22% efficiency
        break;
      case 'Large Map':
        baseLuck = 2000 + Math.floor(Math.random() * 800); // 2000-2800
        baseTokens = Math.floor(baseLuck * (0.15 + Math.random() * 0.10)); // 15-25% efficiency
        break;
      case 'XLarge Map':
        baseLuck = 3200 + Math.floor(Math.random() * 1200); // 3200-4400
        baseTokens = Math.floor(baseLuck * (0.16 + Math.random() * 0.12)); // 16-28% efficiency
        break;
      default:
        baseLuck = 1000;
        baseTokens = 150;
    }
    
    const timestamp = now - (minutesAgo * 60 * 1000);
    let timeAgo;
    if (minutesAgo < 60) {
      timeAgo = `${minutesAgo}min atrás`;
    } else {
      const hours = Math.floor(minutesAgo / 60);
      timeAgo = `${hours}h atrás`;
    }
    
    runs.push({
      id: `real-${timestamp}-${Math.random().toString(36).substr(2, 6)}`,
      map: mapType,
      luck: baseLuck,
      tokens: baseTokens,
      timeAgo,
      timestamp,
      playerName: player,
      level: `${Math.floor(Math.random() * 5) + 1}`, // I-V
      tier: `${Math.floor(Math.random() * 3) + 1}`, // I-III
      charge: Math.floor(Math.random() * 3) + 3 // 3-5
    });
  }
  
  // Ordenar por timestamp (mais recente primeiro)
  return runs.sort((a, b) => b.timestamp - a.timestamp);
}