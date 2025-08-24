interface Env {
  DB: D1Database;
}

interface FeedRun {
  id: string;
  user: string;
  mapName: string;
  tokens: number;
  energy: number;
  efficiency: number;
  luck: number;
  timestamp: number;
  timeAgo: string;
}

export const onRequestGet = async (context) => {
  try {
    const { env } = context;
    
    if (!env.DB) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Database not available' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Buscar runs recentes das últimas 4 horas
    const fourHoursAgo = Date.now() - (4 * 60 * 60 * 1000);
    
    const recentRuns = await env.DB.prepare(`
      SELECT * FROM user_map_drops 
      WHERE created_at > ? 
      ORDER BY created_at DESC 
      LIMIT 12
    `).bind(fourHoursAgo).all();

    const feedData: FeedRun[] = [];
    
    if (recentRuns.results && recentRuns.results.length > 0) {
      recentRuns.results.forEach((run: any, index: number) => {
        try {
          const dropData = JSON.parse(run.drop_data || '{}');
          const userId = `Player${(index % 20) + 1}`; // Player1-Player20 para anonimato
          
          // Calcular tempo atrás
          const timeDiff = Date.now() - run.created_at;
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

          feedData.push({
            id: run.id,
            user: userId,
            mapName: run.map_name || 'Unknown',
            tokens: run.tokens_earned || 0,
            energy: dropData.energyCost || 0,
            efficiency: run.efficiency_rating || 0,
            luck: dropData.luck || 0,
            timestamp: run.created_at,
            timeAgo
          });
        } catch (error) {
          console.log('Error parsing run data:', error);
        }
      });
    }

    // Se não há dados reais, criar dados fake para teste
    if (feedData.length === 0) {
      const fakeRuns: FeedRun[] = [
        {
          id: 'fake-1',
          user: 'Player7',
          mapName: 'L3t2',
          tokens: 245,
          energy: 10,
          efficiency: 24.5,
          luck: 4517,
          timestamp: Date.now() - 5 * 60 * 1000,
          timeAgo: 'há 5 min'
        },
        {
          id: 'fake-2',
          user: 'Player3',
          mapName: 'L5t4',
          tokens: 720,
          energy: 24,
          efficiency: 30.0,
          luck: 8250,
          timestamp: Date.now() - 12 * 60 * 1000,
          timeAgo: 'há 12 min'
        },
        {
          id: 'fake-3',
          user: 'Player1',
          mapName: 'L2t3',
          tokens: 156,
          energy: 16,
          efficiency: 9.75,
          luck: 2100,
          timestamp: Date.now() - 18 * 60 * 1000,
          timeAgo: 'há 18 min'
        },
        {
          id: 'fake-4',
          user: 'Player9',
          mapName: 'L4t1',
          tokens: 89,
          energy: 4,
          efficiency: 22.25,
          luck: 3800,
          timestamp: Date.now() - 23 * 60 * 1000,
          timeAgo: 'há 23 min'
        },
        {
          id: 'fake-5',
          user: 'Player12',
          mapName: 'L1t4',
          tokens: 180,
          energy: 24,
          efficiency: 7.5,
          luck: 1500,
          timestamp: Date.now() - 35 * 60 * 1000,
          timeAgo: 'há 35 min'
        },
        {
          id: 'fake-6',
          user: 'Player5',
          mapName: 'L3t1',
          tokens: 67,
          energy: 4,
          efficiency: 16.75,
          luck: 2900,
          timestamp: Date.now() - 45 * 60 * 1000,
          timeAgo: 'há 45 min'
        }
      ];
      
      feedData.push(...fakeRuns);
    }

    return new Response(JSON.stringify({ 
      success: true,
      runs: feedData,
      total: feedData.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching recent runs:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};