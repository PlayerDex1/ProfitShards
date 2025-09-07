// 🗑️ LIMPEZA DE DADOS FAKE DO FEED
// Remove dados fake e mantém apenas dados reais de usuários autenticados

interface Env {
  DB: D1Database;
}

export async function onRequestPost({ env }: { env: Env }) {
  try {
    console.log('🗑️ LIMPEZA: Removendo dados fake do feed...');

    if (!env.DB) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Database not available'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 1. Verificar dados atuais
    const beforeResult = await env.DB.prepare(`
      SELECT COUNT(*) as total FROM feed_runs
    `).first();

    console.log(`📊 Total de registros antes da limpeza: ${beforeResult?.total || 0}`);

    // 2. Remover dados fake (sem user_email válido ou com nomes fake)
    const fakeNames = [
      'player pa', 'Player', 'DragonSlayer', 'LuckMaster', 'TokenHunter', 
      'GemCrafter', 'MapExplorer', 'FarmKing', 'CrystalMiner', 'ShardCollector',
      'LuckyFarmer', 'MapMaster', 'TokenKing', 'GemHunter', 'CrystalSeeker',
      'ShardLord', 'FarmWizard', 'MapLegend', 'demo_user'
    ];

    // Remover registros com nomes fake
    let deletedCount = 0;
    for (const fakeName of fakeNames) {
      const deleteResult = await env.DB.prepare(`
        DELETE FROM feed_runs 
        WHERE player_name = ? OR player_name LIKE ?
      `).bind(fakeName, `%${fakeName}%`).run();
      
      deletedCount += deleteResult.changes || 0;
      console.log(`🗑️ Removidos ${deleteResult.changes || 0} registros com nome: ${fakeName}`);
    }

    // 3. Remover registros sem user_email válido (dados fake)
    const deleteNoEmailResult = await env.DB.prepare(`
      DELETE FROM feed_runs 
      WHERE user_email IS NULL OR user_email = 'anonymous@feed.com'
    `).run();

    deletedCount += deleteNoEmailResult.changes || 0;
    console.log(`🗑️ Removidos ${deleteNoEmailResult.changes || 0} registros sem email válido`);

    // 4. Verificar dados após limpeza
    const afterResult = await env.DB.prepare(`
      SELECT COUNT(*) as total FROM feed_runs
    `).first();

    console.log(`📊 Total de registros após limpeza: ${afterResult?.total || 0}`);

    // 5. Mostrar dados restantes (apenas para debug)
    const remainingData = await env.DB.prepare(`
      SELECT player_name, map_name, tokens, created_at 
      FROM feed_runs 
      ORDER BY created_at DESC 
      LIMIT 10
    `).all();

    console.log('📋 Dados restantes (últimos 10):', remainingData.results);

    return new Response(JSON.stringify({
      success: true,
      message: 'Dados fake removidos com sucesso',
      data: {
        before: beforeResult?.total || 0,
        after: afterResult?.total || 0,
        deleted: deletedCount,
        remaining: remainingData.results || []
      }
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('❌ Erro ao limpar dados fake:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to clear fake data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}