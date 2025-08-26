interface Env {
  DB: D1Database;
}

interface ClearRequest {
  userId: string;
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  try {
    const body: ClearRequest = await request.json();
    const { userId } = body;

    // Clear all statistics for this user
    await env.DB.prepare(`
      DELETE FROM user_calculations 
      WHERE user_id = ?
    `).bind(userId).run();

    console.log(`🧹 Todas as estatísticas do usuário ${userId} foram removidas`);

    return new Response(JSON.stringify({
      success: true,
      message: 'User statistics cleared',
      userId,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('❌ Erro ao limpar estatísticas:', error);
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