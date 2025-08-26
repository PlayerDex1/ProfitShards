interface Env {
  DB: D1Database;
  KV?: KVNamespace;
}

interface DataAnalysis {
  homePageDataSources: {
    activityStream: {
      table: string;
      query: string;
      currentCount: number;
      sampleData: any[];
      description: string;
    };
    communityStats: {
      tables: string[];
      metrics: {
        totalRuns: number;
        totalProfit: number;
        activeUsers: number;
        successRate: number;
      };
      description: string;
    };
  };
  databaseTables: {
    tableName: string;
    totalRecords: number;
    recentRecords: number; // últimas 24h
    sampleData: any[];
    description: string;
  }[];
  cacheStatus: {
    kvKeys: string[];
    description: string;
  };
  recommendations: string[];
}

export async function onRequestGet({ env }: { env: Env }) {
  try {
    console.log('🔍 ANÁLISE DE DADOS: Mapeando fontes da home page...');

    const analysis: DataAnalysis = {
      homePageDataSources: {
        activityStream: {
          table: 'feed_runs',
          query: 'SELECT * FROM feed_runs WHERE created_at > ? ORDER BY created_at DESC LIMIT 20',
          currentCount: 0,
          sampleData: [],
          description: 'Feed de atividade em tempo real mostrado na home page'
        },
        communityStats: {
          tables: ['feed_runs', 'user_map_drops', 'user_activity', 'user_calculations'],
          metrics: {
            totalRuns: 0,
            totalProfit: 0,
            activeUsers: 0,
            successRate: 0
          },
          description: 'Estatísticas da comunidade mostradas na home page'
        }
      },
      databaseTables: [],
      cacheStatus: {
        kvKeys: [],
        description: 'Cache KV usado para performance'
      },
      recommendations: []
    };

    if (!env.DB) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Database não disponível',
        analysis: null
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // 1. ANALISAR ACTIVITY STREAM (feed_runs)
    const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

    // Contar registros em feed_runs
    const feedRunsCount = await env.DB.prepare('SELECT COUNT(*) as total FROM feed_runs').first();
    const feedRunsRecent = await env.DB.prepare('SELECT COUNT(*) as recent FROM feed_runs WHERE created_at > ?').bind(twentyFourHoursAgo).first();
    
    // Sample de dados do feed_runs
    const feedRunsSample = await env.DB.prepare(`
      SELECT id, map_name, luck, tokens, efficiency, level, tier, charge, player_name, created_at 
      FROM feed_runs 
      ORDER BY created_at DESC 
      LIMIT 5
    `).all();

    analysis.homePageDataSources.activityStream.currentCount = feedRunsCount?.total || 0;
    analysis.homePageDataSources.activityStream.sampleData = feedRunsSample.results || [];

    // 2. ANALISAR COMMUNITY STATS
    const communityStatsQueries = await Promise.all([
      // Total runs (feed_runs + user_map_drops últimos 7 dias)
      env.DB.prepare('SELECT COUNT(*) as count FROM feed_runs WHERE created_at > ?').bind(sevenDaysAgo).first(),
      env.DB.prepare('SELECT COUNT(*) as count FROM user_map_drops WHERE created_at > ?').bind(sevenDaysAgo).first(),
      
      // Total profit (baseado em tokens)
      env.DB.prepare('SELECT SUM(tokens) as total FROM feed_runs WHERE created_at > ?').bind(sevenDaysAgo).first(),
      env.DB.prepare('SELECT SUM(tokens_earned) as total FROM user_map_drops WHERE created_at > ?').bind(sevenDaysAgo).first(),
      
      // Active users (últimas 24h)
      env.DB.prepare('SELECT COUNT(DISTINCT user_id) as count FROM user_activity WHERE created_at > ?').bind(twentyFourHoursAgo).first(),
      
      // Success rate (efficiency_rating > 0.7)
      env.DB.prepare('SELECT COUNT(*) as total, SUM(CASE WHEN efficiency_rating > 0.7 THEN 1 ELSE 0 END) as success FROM user_map_drops WHERE created_at > ?').bind(sevenDaysAgo).first()
    ]);

    const totalRuns = (communityStatsQueries[0]?.count || 0) + (communityStatsQueries[1]?.count || 0);
    const totalTokens = (communityStatsQueries[2]?.total || 0) + (communityStatsQueries[3]?.total || 0);
    const totalProfit = totalTokens * 1000; // $1000 por token
    const activeUsers = communityStatsQueries[4]?.count || 0;
    const successData = communityStatsQueries[5] || { total: 0, success: 0 };
    const successRate = successData.total > 0 ? (successData.success / successData.total) : 0;

    analysis.homePageDataSources.communityStats.metrics = {
      totalRuns,
      totalProfit,
      activeUsers,
      successRate
    };

    // 3. ANALISAR TODAS AS TABELAS
    const tables = ['feed_runs', 'user_map_drops', 'user_activity', 'user_calculations', 'user_equipment_builds', 'users', 'sessions'];
    
    for (const table of tables) {
      try {
        const totalCount = await env.DB.prepare(`SELECT COUNT(*) as total FROM ${table}`).first();
        const recentCount = await env.DB.prepare(`SELECT COUNT(*) as recent FROM ${table} WHERE created_at > ?`).bind(twentyFourHoursAgo).first();
        const sampleData = await env.DB.prepare(`SELECT * FROM ${table} ORDER BY created_at DESC LIMIT 3`).all();

        let description = '';
        switch (table) {
          case 'feed_runs': description = 'Dados do feed de atividade (aparece na home)'; break;
          case 'user_map_drops': description = 'Histórico de runs dos usuários (contribui para stats)'; break;
          case 'user_activity': description = 'Log de atividade dos usuários (usuários ativos)'; break;
          case 'user_calculations': description = 'Histórico de cálculos (contribui para stats)'; break;
          case 'user_equipment_builds': description = 'Builds de equipamentos dos usuários'; break;
          case 'users': description = 'Usuários registrados'; break;
          case 'sessions': description = 'Sessões de autenticação'; break;
        }

        analysis.databaseTables.push({
          tableName: table,
          totalRecords: totalCount?.total || 0,
          recentRecords: recentCount?.recent || 0,
          sampleData: sampleData.results || [],
          description
        });
      } catch (error) {
        console.log(`⚠️ Erro ao analisar tabela ${table}:`, error);
      }
    }

    // 4. ANALISAR CACHE KV
    if (env.KV) {
      try {
        // Tentar buscar chaves conhecidas do cache
        const knownKeys = [
          'activity_stream_cache',
          'community_stats_cache',
          'map_analytics_cache'
        ];

        for (const key of knownKeys) {
          const cached = await env.KV.get(key);
          if (cached) {
            analysis.cacheStatus.kvKeys.push(key);
          }
        }
      } catch (error) {
        console.log('⚠️ Erro ao verificar KV cache:', error);
      }
    }

    // 5. GERAR RECOMENDAÇÕES
    analysis.recommendations = [];

    if (analysis.homePageDataSources.activityStream.currentCount === 0) {
      analysis.recommendations.push('⚠️ Nenhum dado no feed de atividade - usuários verão página vazia');
    }

    if (analysis.homePageDataSources.communityStats.metrics.totalRuns === 0) {
      analysis.recommendations.push('⚠️ Nenhuma run registrada - stats da comunidade mostrarão zeros');
    }

    if (analysis.homePageDataSources.communityStats.metrics.activeUsers === 0) {
      analysis.recommendations.push('⚠️ Nenhum usuário ativo registrado');
    }

    const hasOldData = analysis.databaseTables.some(table => 
      table.totalRecords > 0 && table.recentRecords === 0
    );
    
    if (hasOldData) {
      analysis.recommendations.push('💡 Existem dados antigos que podem ser limpos para começar do zero');
    }

    if (analysis.cacheStatus.kvKeys.length > 0) {
      analysis.recommendations.push(`🔄 Cache ativo em ${analysis.cacheStatus.kvKeys.length} chaves - pode precisar ser limpo`);
    }

    analysis.recommendations.push('🎯 Para dados sólidos: considere popular com runs reais ou dados de demonstração consistentes');

    console.log('📊 Análise completa:', {
      feedRuns: analysis.homePageDataSources.activityStream.currentCount,
      communityRuns: analysis.homePageDataSources.communityStats.metrics.totalRuns,
      activeUsers: analysis.homePageDataSources.communityStats.metrics.activeUsers,
      tablesWithData: analysis.databaseTables.filter(t => t.totalRecords > 0).length
    });

    return new Response(JSON.stringify({
      success: true,
      analysis,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('❌ Erro na análise de dados:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      analysis: null
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}