interface Env {
  DB: D1Database;
}

interface SyncRequest {
  action: 'add' | 'delete';
  userId: string;
  timestamp: number;
  data: {
    investment: number;
    finalProfit: number;
    roi: number;
    efficiency: number;
    tokensEquipment: number;
    tokensFarmed: number;
  };
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  try {
    const body: SyncRequest = await request.json();
    const { action, userId, timestamp, data } = body;

    if (action === 'add') {
      // Add calculation to statistics
      await env.DB.prepare(`
        INSERT OR REPLACE INTO user_calculations (
          id, 
          user_id, 
          calculation_type,
          investment,
          final_profit,
          roi,
          efficiency,
          tokens_equipment,
          tokens_farmed,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        `calc_${timestamp}_${userId}`,
        userId,
        'worldshards_calculation',
        data.investment,
        data.finalProfit,
        data.roi,
        data.efficiency,
        data.tokensEquipment,
        data.tokensFarmed,
        timestamp
      ).run();

      console.log(`✅ Estatística adicionada para usuário ${userId}`);

    } else if (action === 'delete') {
      // Remove calculation from statistics
      await env.DB.prepare(`
        DELETE FROM user_calculations 
        WHERE user_id = ? AND created_at = ?
      `).bind(userId, timestamp).run();

      console.log(`🗑️ Estatística removida para usuário ${userId}`);
    }

    return new Response(JSON.stringify({
      success: true,
      action,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// Handle preflight requests
export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}