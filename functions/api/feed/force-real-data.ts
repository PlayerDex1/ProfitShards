interface Env {
  DB: D1Database;
}

export async function onRequestGet(context: { env: Env; request: Request }) {
  try {
    const { env } = context;
    
    console.log('🔧 FORCE REAL DATA: Forçando dados reais...');
    
    if (!env.DB) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Database not available' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Buscar TODOS os dados da tabela user_map_drops
    const allRuns = await env.DB.prepare(`
      SELECT * FROM user_map_drops 
      ORDER BY created_at DESC
    `).all();

    console.log(`📊 Total runs encontradas: ${allRuns.results?.length || 0}`);

    const feedData = [];
    
    if (allRuns.results && allRuns.results.length > 0) {
      allRuns.results.forEach((run: any, index: number) => {
        try {
          let dropData = {};
          try {
            dropData = JSON.parse(run.drop_data || '{}');
          } catch (e) {
            console.log('⚠️ Erro parsing drop_data, usando vazio');
          }

          // Calcular tempo atrás
          const timeDiff = Date.now() - (run.created_at || Date.now());
          const minutes = Math.floor(timeDiff / (1000 * 60));
          const hours = Math.floor(minutes / 60);
          
          let timeAgo;
          if (hours > 0) {
            timeAgo = `há ${hours}h${minutes % 60 > 0 ? ` ${minutes % 60}min` : ''}`;
          } else if (minutes > 0) {
            timeAgo = `há ${minutes} min`;
          } else {
            timeAgo = 'agora mesmo';
          }

          // Nome anônimo baseado no index
          const playerNum = (index % 20) + 1;
          const userName = `Player${playerNum}`;

          // Mapear nome do mapa
          const mapDisplayNames: Record<string, string> = {
            'small': 'Small Map',
            'medium': 'Medium Map',
            'large': 'Large Map', 
            'xlarge': 'XLarge Map'
          };
          
          const mapName = mapDisplayNames[run.map_name] || mapDisplayNames[run.map_size] || run.map_name || run.map_size || 'Unknown Map';

          // Energia baseada no mapa
          const energyMap: Record<string, number> = {
            'small': 4, 'medium': 8, 'large': 16, 'xlarge': 24
          };
          const energy = energyMap[run.map_name] || energyMap[run.map_size] || (dropData as any).energyCost || 8;

          feedData.push({
            id: run.id,
            user: userName,
            mapName: mapName,
            tokens: run.tokens_earned || 0,
            energy: energy,
            efficiency: run.efficiency_rating || 0,
            luck: (dropData as any).luck || 0,
            timestamp: run.created_at || Date.now(),
            timeAgo: timeAgo
          });

          console.log(`✅ Processada: ${userName} - ${mapName} - ${run.tokens_earned} tokens`);
        } catch (error) {
          console.log('❌ Erro processando run:', error);
        }
      });
    }

    console.log(`🎯 Retornando ${feedData.length} runs processadas`);

    return new Response(JSON.stringify({ 
      success: true,
      runs: feedData,
      total: feedData.length,
      forced: true,
      debug: {
        totalInDB: allRuns.results?.length || 0,
        processed: feedData.length
      }
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('❌ Erro force real data:', error);
    
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