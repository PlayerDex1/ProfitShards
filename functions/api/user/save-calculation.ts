export interface Env {
  DB: D1Database;
}

interface CalculationData {
  type: 'profit' | 'equipment' | 'mapdrops';
  data: any;
  results?: any;
}

export async function onRequestPost({ env, request }: { env: Env; request: Request }) {
  try {
    // Get user from session
    const cookie = request.headers.get('Cookie');
    if (!cookie) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const sessionMatch = cookie.match(/ps_session=([^;]+)/);
    if (!sessionMatch) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const sessionId = sessionMatch[1];

    // Verify session
    const session = await env.DB.prepare(
      'SELECT user_id FROM sessions WHERE session_id = ? AND expires_at > ?'
    ).bind(sessionId, Date.now()).first();

    if (!session) {
      return Response.json({ error: 'Session expired' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json() as CalculationData;
    
    if (!body.type || !body.data) {
      return Response.json({ error: 'Invalid calculation data' }, { status: 400 });
    }

    // Save calculation
    const calculationId = crypto.randomUUID();
    const now = Date.now();

    await env.DB.prepare(`
      INSERT INTO user_calculations (id, user_id, calculation_type, calculation_data, result_data, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      calculationId,
      session.user_id,
      body.type,
      JSON.stringify(body.data),
      body.results ? JSON.stringify(body.results) : null,
      now,
      now
    ).run();

    // Log activity
    await env.DB.prepare(`
      INSERT INTO user_activity (id, user_id, activity_type, activity_data, created_at)
      VALUES (?, ?, 'calculation_saved', ?, ?)
    `).bind(
      crypto.randomUUID(),
      session.user_id,
      JSON.stringify({ type: body.type, calculationId }),
      now
    ).run();

    console.log('Calculation saved for user:', session.user_id);

    return Response.json({ 
      success: true, 
      calculationId,
      message: 'Calculation saved successfully' 
    });

  } catch (error) {
    console.error('Save calculation error:', error);
    return Response.json({ 
      error: 'Failed to save calculation',
      details: error.message 
    }, { status: 500 });
  }
}